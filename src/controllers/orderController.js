// src/controllers/orderController.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const Order     = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product   = require('../models/Product');
const Customer  = require('../models/Customer'); // o User si usas User

// Crear un nuevo pedido
exports.createOrder = async (req, res) => {
  const { customerId, items } = req.body;
  if (!customerId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Datos de orden incompletos' });
  }

  try {
    const result = await sequelize.transaction(async (tx) => {
      // 1) Crear la orden
      const order = await Order.create(
        { customerId, status: 'pending' },
        { transaction: tx }
      );

      // 2) Para cada ítem, verificar stock y crear OrderItem
      for (const it of items) {
        const product = await Product.findByPk(it.productId, { transaction: tx });
        if (!product) throw new Error(`Producto ${it.productId} no existe`);
        if (product.stock < it.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }
        // Descontar stock
        product.stock -= it.quantity;
        await product.save({ transaction: tx });

        // Crear línea de pedido
        await OrderItem.create(
          {
            orderId: order.id,
            productId: it.productId,
            quantity: it.quantity,
            price: product.price
          },
          { transaction: tx }
        );
      }

      // 3) Retornar la orden completa con sus items
      return await Order.findByPk(order.id, {
        include: [{ model: OrderItem }, { model: Customer }],
        transaction: tx
      });
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error('Error en createOrder:', err);
    return res.status(500).json({ message: err.message || 'Error al crear orden' });
  }
};

// Listar órdenes de un cliente
exports.getCustomerOrders = async (req, res) => {
  const { clientId } = req.query;
  try {
    const orders = await Order.findAll({
      where: { customerId: clientId },
      include: [OrderItem]
    });
    return res.json(orders);
  } catch (err) {
    console.error('Error en getCustomerOrders:', err);
    return res.status(500).json({ message: 'Error al obtener órdenes' });
  }
};

// Listar todas las órdenes (admin)
exports.getAllOrders = async (_, res) => {
  try {
    const orders = await Order.findAll({ include: [OrderItem, Customer] });
    return res.json(orders);
  } catch (err) {
    console.error('Error en getAllOrders:', err);
    return res.status(500).json({ message: 'Error al obtener órdenes' });
  }
};

// Actualizar estado
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    order.status = status;
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error('Error en updateOrderStatus:', err);
    return res.status(500).json({ message: 'Error al actualizar estado' });
  }
};
