// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// GET /api/products            → lista de productos
router.get('/', authenticate, getAllProducts);

// GET /api/products/:id        → detalle de un producto
router.get('/:id', authenticate, getProductById);

// POST /api/products           → crear producto (sólo admin)
router.post('/', authenticate, authorizeAdmin, createProduct);

// PUT /api/products/:id        → editar producto (sólo admin)
router.put('/:id', authenticate, authorizeAdmin, updateProduct);

// DELETE /api/products/:id     → borrar producto (sólo admin)
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

module.exports = router;
