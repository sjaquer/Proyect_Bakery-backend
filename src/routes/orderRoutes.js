// src/routes/orderRoutes.js
const express = require('express');
const router  = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
router.get('/me', getMe);
// Cliente crea pedido
router.post('/', protect, orderController.createOrder);

// Cliente ve sus pedidos
router.get('/', protect, orderController.getCustomerOrders);

// Admin ve todas las órdenes
router.get('/all', protect, isAdmin, orderController.getAllOrders);

// Admin actualiza estado
router.patch('/:id/status', protect, isAdmin, orderController.updateOrderStatus);

module.exports = router;
