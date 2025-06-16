// =============================
// src/controllers/orderController.js
// =============================

const { Sequelize } = require('sequelize');
const sequelize       = require('../config/database');
const Order           = require('../models/Order');
const OrderItem       = require('../models/OrderItem');
const Product         = require('../models/Product');
const Customer        = require('../models/Customer'); // o User si usas User
const orderEvents     = require('../utils/orderEvents');

// Convierte ids numéricos a strings para evitar errores en el frontend
const formatOrder = (ord) => {
  if (!ord) return ord;
  const plain = ord.get ? ord.get({ plain: true }) : ord;
  plain.id = plain.id.toString();
  if (plain.customerId !== undefined) plain.customerId = String(plain.customerId);
  if (plain.Customer) {
    plain.Customer.id = String(plain.Customer.id);
  }
  if (Array.isArray(plain.OrderItems)) {
    plain.OrderItems = plain.OrderItems.map((it) => {
      const item = it.get ? it.get({ plain: true }) : it;
      item.id = String(item.id);
      if (item.orderId !== undefined) item.orderId = String(item.orderId);
      if (item.productId !== undefined) item.productId = String(item.productId);
      if (item.Product) item.Product.id = String(item.Product.id);
      return item;
    });
  }
  return plain;
};

// Crear un nuevo pedido
exports.createOrder = async (req, res) => {
  const { items, customerInfo, paymentMethod } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Datos de orden incompletos' });
  }
  try {
    const result = await sequelize.transaction(async (tx) => {
      let customerId = req.user?.id;
      if (!customerId) {
        // Invitado: crear o buscar Customer por teléfono
        const { name, phone, email, address } = customerInfo;
        const [customer] = await Customer.findOrCreate({
          where: { phone },
          defaults: { name, email, address }
        });
        customerId = customer.id;
      }

      // 1) Crear la orden inicial
      const order = await Order.create(
        { customerId, status: 'pending', paymentMethod, total: 0 },
        { transaction: tx }
      );

      let orderTotal = 0;

      // 2) Para cada ítem, verificar stock y crear OrderItem
      for (const it of items) {
        const product = await Product.findByPk(it.productId, { transaction: tx });
        if (!product) throw new Error(`Producto ${it.productId} no existe`);
        if (product.stock < it.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }

        const subtotal = parseFloat(product.price) * it.quantity;
        orderTotal += subtotal;

        // Descontar stock
        product.stock -= it.quantity;
        await product.save({ transaction: tx });

        // Crear línea de pedido
        await OrderItem.create(
          {
            orderId:   order.id,
            productId: it.productId,
            quantity:  it.quantity,
            priceUnit: product.price,
            subtotal
          },
          { transaction: tx }
        );
      }

      // 3) Actualizar total y retornar la orden completa con sus items
      order.total = orderTotal;
      await order.save({ transaction: tx });

      return await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'OrderItems',
            include: [{ model: Product, as: 'Product', attributes: ['id', 'name', 'price'] }]
          },
          {
            model: Customer,
            as: 'Customer',
            attributes: ['id', 'name', 'email', 'phone', 'address']
          }
        ],
        transaction: tx
      });
    });

    const formatted = formatOrder(result);
    const resumen = formatted.OrderItems
      .map((it) => `${it.quantity}x ${it.Product.name}`)
      .join(', ');
    return res.status(201).json({
      ...formatted,
      message:
        'Pedido registrado. Espera confirmaci\u00f3n de la tienda para su preparaci\u00f3n.',
      resumen,
    });
  } catch (err) {
    console.error('Error en createOrder:', err);
    return res.status(500).json({ message: err.message || 'Error al crear orden' });
  }
};

// Listar órdenes de un cliente
exports.getCustomerOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const include = [
      {
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'price']
        }]
      }
    ];
    if (req.query.expand === 'customer') {
      include.push({
        model: Customer,
        as: 'Customer',
        attributes: ['id', 'name', 'email', 'phone', 'address']
      });
    }
    const orders = await Order.findAll({
      where: { customerId },
      include,
      order: [['createdAt', 'DESC']]
    });
    return res.json(orders.map(formatOrder));
  } catch (err) {
    console.error('Error en getCustomerOrders:', err);
    return res.status(500).json({ message: 'Error al obtener órdenes' });
  }
};

// Listar todas las órdenes (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const include = [
      {
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'price']
        }]
      }
    ];
    if (req.query.expand === 'customer') {
      include.push({
        model: Customer,
        as: 'Customer',
        attributes: ['id', 'name', 'email', 'phone', 'address']
      });
    }
    const orders = await Order.findAll({
      include,
      order: [['createdAt', 'DESC']]
    });
    return res.json(orders.map(formatOrder));
  } catch (err) {
    console.error('Error en getAllOrders:', err);
    return res.status(500).json({ message: 'Error al obtener órdenes' });
  }
};

// Actualizar estado de la orden
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    order.status = status;
    await order.save();
    orderEvents.emit('orders-updated', { id: order.id });
    const msg =
      status === 'received'
        ? 'La tienda ha recibido tu pedido y lo est\u00e1 preparando.'
        : 'Estado actualizado';
    return res.json({
      ...formatOrder(order),
      message: msg,
    });
  } catch (err) {
    console.error('Error en updateOrderStatus:', err);
    return res.status(500).json({ message: 'Error al actualizar estado' });
  }
};

// Obtener orden por ID
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const include = [
      {
        model: OrderItem,
        as: 'OrderItems',
        include: [{
          model: Product,
          as: 'Product',
          attributes: ['id', 'name', 'price']
        }]
      }
    ];
    if (req.query.expand === 'customer') {
      include.push({
        model: Customer,
        as: 'Customer',
        attributes: ['id', 'name', 'email', 'phone', 'address']
      });
    }
    const order = await Order.findByPk(id, { include });
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    if (
      req.user.role !== 'admin' &&
      String(order.customerId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    return res.json(formatOrder(order));
  } catch (err) {
    console.error('Error en getOrderById:', err);
    return res.status(500).json({ message: 'Error al obtener orden' });
  }
};

// Eliminar orden
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    const isOwner = String(order.customerId) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && (!isOwner || order.status !== 'pending')) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    await order.destroy();
    orderEvents.emit('orders-updated', { id: order.id });
    return res.status(204).end();
  } catch (err) {
    console.error('Error en deleteOrder:', err);
    return res.status(500).json({ message: 'Error al eliminar orden' });
  }
};
