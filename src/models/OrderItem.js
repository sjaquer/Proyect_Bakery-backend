// src/models/OrderItem.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product  = require('./Product');

class OrderItem extends Model {}


OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    priceUnit: {
      // Se llama priceUnit en tu BD
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    subtotal: {
      // También lo defines en la tabla
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'orderId'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'productId'
    }
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
);

// Relaciones:
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'Product' });
Product.hasMany(OrderItem,   { foreignKey: 'productId', as: 'orderItems' });

module.exports = OrderItem;