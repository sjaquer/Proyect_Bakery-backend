// src/controllers/authController.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Público
exports.loginUser = async (req, res) => {
  console.log('🔐 loginUser llamado', { body: req.body, JWT_SECRET: !!process.env.JWT_SECRET });
  const { email, password } = req.body;
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET no está definido en process.env');
    return res.status(500).json({ message: 'Error interno de configuración' });
  }

export const getMe = (req, res) => {
  try {
    const payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    res.json({ id: payload.id, role: payload.role });
  } catch {
    res.status(401).json({ message: 'No autenticado' });
  }
};

res.cookie('token', token, {
  httpOnly: true,
  secure: true,             // HTTPS obligatorio
  sameSite: 'none',         // <- aquí
  maxAge: 24 * 60 * 60 * 1000,
  domain: 'digital-bakery-backend.onrender.com'  // opcional, para asegurar el scope
});

exports.registerUser = async (req, res) => {
  const { name, email, password, role = 'customer' } = req.body;
  try {
    // Encriptar contraseña con bcryptjs
    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token,
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
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Comparar con bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Error en loginUser:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  };
