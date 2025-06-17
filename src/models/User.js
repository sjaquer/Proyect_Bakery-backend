// src/models/User.js
// ----------------------
// Modelo "User" para autenticación (podría usarse tanto para admin como para clientes registrados).
// Campos:
//  - id (PK), name, email, password (hashed), role ('admin' o 'customer')
//  - createdAt, updatedAt automáticos

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    // Aquí guardaremos el hash bcrypt (no la contraseña en texto claro)
  },
  role: {
    type: DataTypes.ENUM('admin', 'customer'),
    allowNull: false,
    defaultValue: 'customer',
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;

// Asociación 1:1 con Customer
const Customer = require('./Customer');
User.hasOne(Customer, { foreignKey: 'id', as: 'customer' });
