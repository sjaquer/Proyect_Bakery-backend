// src/controllers/authController.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Customer = require('../models/Customer');

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Público
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // 1) Verificar duplicado
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // 2) Hashear password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // 3) Crear usuario
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'customer',
      phone,
      address,
    });

    // 3b) Crear registro de Customer vinculado
    await Customer.create({
      id: newUser.id,
      name,
      phone,
      email,
      address,
    });

    // 4) Generar token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5) Devolver shape { user, token } que tu frontend espera
    return res.status(201).json({
      user: {
        id: newUser.id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt.toISOString(),
        phone: newUser.phone || null,
        address: newUser.address || null,
      },
      token,
    });
  } catch (err) {
    console.error('Error registerUser:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @route   POST /api/auth/login
// @desc    Autenticar usuario
// @access  Público
exports.loginUser = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no definido');
      return res.status(500).json({ message: 'Error de configuración' });
    }

    const { email, password } = req.body;

    // 1) Buscar usuario con su información de contacto
    const user = await User.findOne({
      where: { email },
      include: [
        { model: Customer, as: 'customer', attributes: ['phone', 'address'] }
      ],
      attributes: { include: ['phone', 'address'] }
    });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 2) Verificar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3) Generar token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4) Responder con { user, token }
    return res.json({
      user: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        phone: user.phone || user.customer?.phone || null,
        address: user.address || user.customer?.address || null,
      },
      token,
    });
  } catch (err) {
    console.error('Error loginUser:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
