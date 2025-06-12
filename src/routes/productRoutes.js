// src/routes/productRoutes.js
// ----------------------------
// Rutas para productos:
//   GET    /api/products        → listar todos los productos
//   GET    /api/products/:id    → ver un producto por su ID
//   POST   /api/products        → crear un producto (admin)
//   PUT    /api/products/:id    → actualizar un producto (admin)
//   DELETE /api/products/:id    → eliminar un producto (admin)
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../api/axiosConfig';
export const ProtectedRoute = ({ children }) => {
  const [ok, setOk] = useState<boolean | null>(null);
  const loc = useLocation();
router.get('/me', getMe);
  useEffect(() => {
    api.get('/api/auth/me')      // crea este endpoint que lee la cookie y devuelve { id, role }
      .then(() => setOk(true))
      .catch(() => setOk(false));
  }, []);

  if (ok === null) return <p>Cargando sesión…</p>;
  if (!ok) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <>{children}</>;
};

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
