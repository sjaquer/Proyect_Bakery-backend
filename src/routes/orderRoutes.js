// src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// GET /api/orders           → Pedidos del usuario logueado
router.get('/', protect, orderController.getUserOrders);

// GET /api/orders/all       → TODOS los pedidos (solo admin)
router.get('/all', protect, isAdmin, orderController.getAllOrders);

// POST /api/orders          → Crear nuevo pedido
router.post('/', protect, orderController.createOrder);

// …otras rutas si tienes…

module.exports = router;
