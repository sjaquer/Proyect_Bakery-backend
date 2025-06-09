// src/routes/orderRoutes.js
// --------------------------
// Rutas para órdenes:
//   POST   /api/orders             → crear nueva orden
//   GET    /api/orders             → listar órdenes (admin o cliente)
//   PATCH  /api/orders/:id/status  → actualizar estado de orden (admin)

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Crear nueva orden (público)
router.post('/', orderController.createOrder);

// Listar órdenes:
// - Si el usuario es admin → devuelve todas
// - Si el usuario es customer y envía ?clientId=xxx → devuelve solo sus órdenes
router.get('/', protect, orderController.getOrders);

// Actualizar estado de orden (solo admin)
router.patch('/:id/status', protect, isAdmin, orderController.updateOrderStatus);

module.exports = router;
