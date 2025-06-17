// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();

// Controladores de producto
const productController = require('../controllers/productController');
const validate = require('../middleware/validate');

// Middleware de autenticación/autorización
const { protect, isAdmin } = require('../middleware/authMiddleware');

// → Rutas públicas
// GET /api/products          → Lista todos los productos
router.get('/', productController.getAllProducts);

// GET /api/products/:id      → Detalle de un producto
router.get('/:id', productController.getProductById);

// → Rutas protegidas (solo admin)
// POST /api/products         → Crear producto
router.post(
  '/',
  protect,
  isAdmin,
  validate({
    name: { required: true },
    description: { required: true },
    price: { required: true, type: 'number' },
    stock: { required: true, type: 'integer' },
    imageUrl: {}
  }),
  productController.createProduct
);

// PUT /api/products/:id      → Actualizar producto
router.put(
  '/:id',
  protect,
  isAdmin,
  validate({
    name: {},
    description: {},
    price: { type: 'number' },
    stock: { type: 'integer' },
    imageUrl: {}
  }),
  productController.updateProduct
);

// DELETE /api/products/:id   → Eliminar producto
router.delete('/:id', protect, isAdmin, productController.deleteProduct);

module.exports = router;
