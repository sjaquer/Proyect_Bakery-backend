// src/routes/authRoutes.js
// ------------------------
// Rutas para autenticación:
//   POST /api/auth/register  → registrar usuario (customer o admin)
//   POST /api/auth/login     → login y obtener JWT

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registro de usuario
router.post('/register', authController.registerUser);

// Login de usuario
router.post('/login', authController.loginUser);

module.exports = router;
