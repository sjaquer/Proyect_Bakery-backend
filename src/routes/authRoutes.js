// src/routes/authRoutes.js
// ------------------------
// Rutas para autenticación:
//   POST /api/auth/register  → registrar usuario (customer o admin)
//   POST /api/auth/login     → login y obtener JWT

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

// Registro de usuario
router.post(
  '/register',
  validate({
    name: { required: true },
    email: { required: true, type: 'email' },
    password: { required: true },
    role: { enum: ['admin', 'customer'] }
  }),
  authController.registerUser
);

// Login de usuario
router.post(
  '/login',
  validate({
    email: { required: true, type: 'email' },
    password: { required: true }
  }),
  authController.loginUser
);

module.exports = router;
