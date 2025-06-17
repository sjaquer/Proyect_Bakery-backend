// src/models/Order.js
const { Model, DataTypes } = require('sequelize');
const sequelize  = require('../config/database');
const Customer   = require('./Customer');
const OrderItem  = require('./OrderItem');

class Order extends Model {}
Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      // Posibles estados del pedido
      type: DataTypes.ENUM(
        'pending',
        'received',
        'delivered',
        'cancelled',
        'rejected'
      ),
      defaultValue: 'pending'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    isDelivery: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    estimatedTime: {
      type: DataTypes.INTEGER, // minutos u otro
      allowNull: true
    },
    customerId: {
      // En tu tabla es customerId
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customerId'
    }
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

// Asociaciones

// 1) Cliente ↔ Pedidos
Customer.hasMany(Order,    { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer,  { foreignKey: 'customerId', as: 'Customer' });

// 2) Pedido ↔ Líneas de pedido
Order.hasMany(OrderItem,   { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'OrderItems' });

 module.exports = Order;