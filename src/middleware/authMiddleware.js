// src/middleware/authMiddleware.js

require('dotenv').config();
const jwt = require('jsonwebtoken');

// Verifica que el usuario está autenticado
exports.protect = (req, res, next) => {
  let token;

  // Token en header Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'No autorizado, token faltante' });
  }

  try {
    // Verificar JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error('Error en authMiddleware protect:', error);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Verifica que el usuario sea admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Recurso restringido al admin' });
};
