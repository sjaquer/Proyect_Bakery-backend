// src/routes/productRoutes.js
// ----------------------------
// Rutas para productos:
//   GET    /api/products        → listar todos los productos
//   GET    /api/products/:id    → ver un producto por su ID
//   POST   /api/products        → crear un producto (admin)
//   PUT    /api/products/:id    → actualizar un producto (admin)
//   DELETE /api/products/:id    → eliminar un producto (admin)

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// ✅ Rutas públicas
router.get('/', productController.getAllProducts);     // 🔥 Solo esta definición
router.get('/:id', productController.getProductById);

// ✅ Rutas protegidas (solo admin)
router.post('/', protect, isAdmin, productController.createProduct);
router.put('/:id', protect, isAdmin, productController.updateProduct);
router.delete('/:id', protect, isAdmin, productController.deleteProduct);

module.exports = router;
