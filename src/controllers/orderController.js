// src/controllers/orderController.js
// ----------------------------------
// Lógica para endpoints de órdenes:
//  - createOrder
//  - getOrders
//  - updateOrderStatus

const { Op } = require('sequelize');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User'); // si queremos vincular órdenes a usuarios registrados

// @route   POST /api/orders
// @desc    Crear una nueva orden (cliente no autenticado o autenticado)
// @access  Público (para clientes no registrados)
exports.createOrder = async (req, res) => {
  /*
    Se espera recibir en req.body algo así:
    {
      customer: {
        name: 'Juan Pérez',
        phone: '987654321',
        email: 'juan@mail.com',
        address: 'Av. Siempre Viva 742'
      },
      items: [
        { productId: 1, quantity: 2 },
        { productId: 3, quantity: 1 }
      ],
      isDelivery: true/false
    }
  */
  try {
    const { customer, items, isDelivery } = req.body;

    // 1) Validar campos mínimos
    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Datos de cliente o ítems de orden incompletos.' });
    }
    const { name, phone, email, address } = customer;
    if (!name || !phone || (!isDelivery && !address)) {
      return res.status(400).json({ message: 'Faltan datos obligatorios del cliente o dirección.' });
    }

    // 2) Crear o buscar Customer según phone (si queremos permitir que un mismo phone no duplique cliente)
    let customerRecord = await Customer.findOne({ where: { phone } });
    if (!customerRecord) {
      customerRecord = await Customer.create({ name, phone, email, address });
    } else {
      // Si ya existía, actualizamos su dirección y email (opcional)
      customerRecord.name = name;
      customerRecord.email = email;
      customerRecord.address = address;
      await customerRecord.save();
    }

    // 3) Calcular total y chequear stock
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.productId} no existe.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para ${product.name}.` });
      }
      totalAmount += parseFloat(product.price) * item.quantity;
    }

    // 4) Calcular tiempo estimado
    const estimatedTime = isDelivery ? 45 : 30; // ejemplos fijos

    // 5) Crear la orden
    const newOrder = await Order.create({
      total: totalAmount.toFixed(2),
      status: 'pending',
      isDelivery: isDelivery,
      estimatedTime,
      customerId: customerRecord.id,
    });

    // 6) Crear los OrderItems y restar stock de cada producto
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      const subtotal = parseFloat(product.price) * item.quantity;
      await OrderItem.create({
        orderId: newOrder.id,
        productId: product.id,
        quantity: item.quantity,
        priceUnit: product.price,
        subtotal: subtotal.toFixed(2),
      });
      // Restar stock
      product.stock -= item.quantity;
      await product.save();
    }

    // 7) Retornar la orden creada con sus ítems
    const orderWithItems = await Order.findByPk(newOrder.id, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, as: 'product', attributes: ['name', 'price'] }],
        },
        { model: Customer, as: 'customer' },
      ],
    });

    return res.status(201).json(orderWithItems);
  } catch (error) {
    console.error('Error en createOrder:', error);
    return res.status(500).json({ message: 'Error al procesar la orden.' });
  }
};

// @route   GET /api/orders
// @desc    Obtener órdenes. 
//          - Si el usuario es admin → devuelve todas. 
//          - Si es customer y envía ?clientId=xxx → devuelve solo sus órdenes.
// @access  Privado (protect)
exports.getOrders = async (req, res) => {
  try {
    const user = req.user; // lo coloca el middleware protect
    const clientIdQuery = req.query.clientId;

    // Si es admin, devuelve todo:
    if (user.role === 'admin') {
      const allOrders = await Order.findAll({
        include: [
          { model: Customer, as: 'customer' },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [{ model: Product, as: 'product', attributes: ['name', 'price'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      return res.json(allOrders);
    }

    // Si NO es admin, solo puede solicitar sus órdenes (clientId debe coincidir con su user ID o 
    // podemos usar phone/email para asociar, pero en este ejemplo asumiremos clientId = customerId:
    if (user.role === 'customer') {
      if (!clientIdQuery) {
        return res.status(400).json({ message: 'Debe enviar clientId para ver sus órdenes.' });
      }
      // Se asegura que clientIdQuery coincida con user.customerId si implementaste esa relación.
      // En este ejemplo, asumiremos user.id === Customer.id. Si son independientes, hay que adaptar.
      if (parseInt(clientIdQuery) !== user.id) {
        return res.status(403).json({ message: 'No autorizado para ver estas órdenes.' });
      }
      const customerOrders = await Order.findAll({
        where: { customerId: clientIdQuery },
        include: [
          { model: Customer, as: 'customer' },
          {
            model: OrderItem,
            as: 'orderItems',
            include: [{ model: Product, as: 'product', attributes: ['name', 'price'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
      });
      return res.json(customerOrders);
    }

    // Otro role no permitido:
    return res.status(403).json({ message: 'No autorizado.' });
  } catch (error) {
    console.error('Error en getOrders:', error);
    return res.status(500).json({ message: 'Error al obtener las órdenes.' });
  }
};

// @route   PATCH /api/orders/:id/status
// @desc    Actualizar estado de una orden (solo admin)
// @access  Privado (admin)
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // esperamos uno de: 'pending', 'inPreparation', 'sent', 'delivered', 'cancelled'
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada.' });
    }
    // Validar status válido
    const validStatuses = ['pending', 'inPreparation', 'sent', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido.' });
    }
    order.status = status;
    await order.save();
    return res.json({ message: 'Estado actualizado.', order });
  } catch (error) {
    console.error('Error en updateOrderStatus:', error);
    return res.status(500).json({ message: 'Error al actualizar estado.' });
  }
};
