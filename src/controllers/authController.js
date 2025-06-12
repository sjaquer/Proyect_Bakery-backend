// src/controllers/authController.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Público
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1) Verificar que no exista ya ese email
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // 2) Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3) Crear usuario
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    // 4) Firmar JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5) Enviar cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    });

    // 6) Devolver datos del usuario (sin password)
    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error('Error en registerUser:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @route   POST /api/auth/login
// @desc    Autenticar usuario
// @access  Público
exports.loginUser = async (req, res) => {
  try {
    // 0) Asegurarnos de tener la clave
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET no está definido en process.env');
      return res.status(500).json({ message: 'Error de configuración' });
    }

    const { email, password } = req.body;

    // 1) Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 2) Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3) Firmar JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4) Enviar cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 5) Devolver datos del usuario
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error('Error en loginUser:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};
