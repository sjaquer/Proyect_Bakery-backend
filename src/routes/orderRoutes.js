// =============================
// src/routes/orderRoutes.js
// =============================

const express       = require('express');
const router        = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getAllOrders,
  updateOrderStatus,
  modifyOrder,
  getOrderById,
  deleteOrder
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

// Rutas de pedidos
router.post(
  '/',
  protect,
  validate({
    items: { required: true, type: 'array' },
    paymentMethod: { required: true },
    isDelivery: { type: 'boolean' }
  }),
  createOrder
);
router.get('/',            protect,           getCustomerOrders);
router.get('/all',         protect,    isAdmin, getAllOrders);
router.patch('/:id', protect, modifyOrder);
router.put(
  '/:id/status',
  protect,
  isAdmin,
  validate({ status: { required: true } }),
  updateOrderStatus
);
router.delete('/:id',      protect,           deleteOrder);
router.get('/:id',         protect,           getOrderById);

module.exports = router;
