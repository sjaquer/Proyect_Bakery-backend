// =============================
// src/routes/orderRoutes.js
// =============================

const express       = require('express');
const router        = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rutas de pedidos
// Se permite POST sin JWT para invitado (createOrder internamente gestiona guest)
router.post('/',           createOrder);
router.get('/',            protect,           getCustomerOrders);
router.get('/all',         protect,    isAdmin, getAllOrders);
router.put('/:id/status',  protect,    isAdmin, updateOrderStatus);

module.exports = router;
