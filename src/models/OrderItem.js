// src/models/OrderItem.js
// ----------------------
// Modelo "OrderItem" (ítem de una orden).
// Campos:
//  - id (PK), quantity, priceUnit, subtotal
//  - orderId (FK), productId (FK), createdAt, updatedAt

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');
const Product = require('./Product');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  priceUnit: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    // se calcula como priceUnit * quantity
  },
}, {
  tableName: 'order_items',
  timestamps: true,
});

// Relaciones:
// 1) Un OrderItem pertenece a un Order
OrderItem.belongsTo(Order, {
  foreignKey: {
    name: 'orderId',
    allowNull: false,
  },
  as: 'order',
});
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'orderItems',
});

// 2) Un OrderItem pertenece a un Product
OrderItem.belongsTo(Product, { 
  foreignKey: 'productId', as: 'Product' 
});

Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems',
});

module.exports = OrderItem;
