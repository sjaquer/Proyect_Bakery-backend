// src/models/Order.js
// ----------------------
// Modelo "Order" (orden de compra).
// Campos:
//  - id (PK), total, status, customerId (FK), createdAt, updatedAt
//  - estimatedTime: tiempo estimado de preparación/envío (en minutos)
//  - isDelivery: boolean (true=envío, false=pickup)
// status será un enum: 'pending', 'inPreparation', 'sent', 'delivered', 'cancelled'

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Customer = require('./Customer');
const OrderItem = require('./OrderItem');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'inPreparation', 'sent', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  isDelivery: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  estimatedTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
    // En minutos: ej. 30 (pickup) o 45 (delivery)
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

// Relación: cada Order pertenece a un Customer
Order.belongsTo(Customer, {
  foreignKey: {
    name: 'customerId',
    allowNull: false,
  },
  as: 'customer',
});

Customer.hasMany(Order, {
   foreignKey: 'customerId',
   as: 'orders',
 });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });

 module.exports = Order;