// src/controllers/authController.js
// ---------------------------------
// Lógica para endpoints de autenticación:
//  - registerUser
//  - loginUser

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const generateToken = require('../utils/generateToken');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiame_por_una_clave_segura';

// @route   POST /api/auth/register
// @desc    Registrar un nuevo usuario (customer o admin)
// @access  Público (admin se deberá registrar manualmente o con seed)
exports.registerUser = async (req, res) => {
  /*
    Se espera req.body:
    {
      name: 'Nombre',
      email: 'email@mail.com',
      password: '123456',
      role: 'customer'  // puede ser 'customer' o 'admin' si se permite registro de admin
    }
  */
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    // 1) Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email ya registrado.' });
    }

    // 2) Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3) Crear el usuario
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'customer',
    });

    // 4) Si role = 'customer', creamos también un registro en Customer (opcional)
    if (newUser.role === 'customer') {
      await Customer.create({
        name,
        phone: '',    // Teléfono vacío por defecto; se puede actualizar luego
        email,
        address: '',
      });
    }

    // 5) Generar token y devolver datos
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token,
    });
  } catch (error) {
    console.error('Error en registerUser:', error);
    return res.status(500).json({ message: 'Error al registrar usuario.' });
  }
};

// @route   POST /api/auth/login
// @desc    Autenticar usuario y devolver JWT
// @access  Público
exports.loginUser = async (req, res) => {
  /*
    Se espera req.body:
    {
      email: 'usuario@mail.com',
      password: '123456'
    }
  */
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan email o contraseña.' });
    }

    // 1) Buscar usuario por email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 2) Comparar password con bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3) Generar token
    const token = generateToken(user.id, user.email, user.role);

    // 4) Responder con datos del usuario y token
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Error en loginUser:', error);
    return res.status(500).json({ message: 'Error al autenticar usuario.' });
  }
};
