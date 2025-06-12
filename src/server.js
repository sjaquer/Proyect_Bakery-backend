// src/server.js

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

// Importa tus routers
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
// … cualquier otro router …

// Crea la app
const app = express();

// Middlewares globales
app.use(express.json());                              // parsea JSON
app.use(express.urlencoded({ extended: true }));      // parsea URL-encoded, si lo necesitas
app.use(cookieParser());                              // parsea cookies
app.use(
  cors({
    origin: [
      'https://digitalbakery.vercel.app',
      'https://digital-bakery-backend.onrender.com'
    ],
    credentials: true
  })
);

// Rutas de la API
app.use('/api/auth',     authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
// … monta aquí el resto de tus rutas …

// Conexión a la base de datos
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});
sequelize
  .authenticate()
  .then(() => console.log('🔌 Conectando a PostgreSQL via DATABASE_URL'))
  .catch((err) => console.error('❌ Error al conectar BD:', err));

// Inicia el servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
