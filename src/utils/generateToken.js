// Función para generar un JWT firmado con userId, email y role.
// TTL (tiempo de expiración) se fijará en 1 día (opcional).

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'cambiame_por_una_clave_segura';

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

module.exports = generateToken;
