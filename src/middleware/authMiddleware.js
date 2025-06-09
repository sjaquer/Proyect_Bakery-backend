// Middleware para proteger rutas con JWT y chequear rol de admin.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiame_por_una_clave_segura';

// 1) protect: verifica el token y adjunta req.user = { id, email, role }
exports.protect = async (req, res, next) => {
  let token;

  // Revisar si existe header Authorization con Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1]; // "Bearer <token>"
      const decoded = jwt.verify(token, JWT_SECRET);
      // decoded contiene: { id, email, role, iat, exp }
      // Buscamos el user en BD para asegurarnos de que exista
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Token inválido (usuario no existe).' });
      }
      // Adjuntamos al req.user
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      return next();
    } catch (error) {
      console.error('Error en authMiddleware.protect:', error);
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }
  }

  // Si no viene token:
  return res.status(401).json({ message: 'No se encontró token, autorización denegada.' });
};

// 2) isAdmin: solo deja pasar si req.user.role === 'admin'
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de admin.' });
};
