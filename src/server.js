// src/server.js
// Servidor Express para Digital Bakery

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const sequelize = require('./config/database');

// Modelos
require('./models/Product');
require('./models/Customer');
require('./models/Order');
require('./models/OrderItem');
require('./models/User');

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// ---------------------------------------------------------
// ✅ CORS: permitir desde Vercel y ngrok
// ---------------------------------------------------------
const app = express();

const corsOrigins = [
  /\.vercel\.app$/,
  /\.ngrok-free\.app$/,
];

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    // si alguno de los regex casa con el origin, lo permitimos
    if (corsOrigins.some(rx => rx.test(origin))) {
      return callback(null, true);
    }
    console.warn('❌ CORS bloqueado para:', origin);
    return callback(new Error('CORS no permitido'), false);
  },
  credentials: true,
}));


// ---------------------------------------------------------
// ✅ Middleware
// ---------------------------------------------------------
app.use(express.json());

// ---------------------------------------------------------
// ✅ Ruta raíz para evitar landing page de ngrok
// ---------------------------------------------------------
app.get('/', (req, res) => {
  res.send('🎉 Digital Bakery API está corriendo');
});

// ---------------------------------------------------------
// ✅ Rutas de API
// ---------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ---------------------------------------------------------
// ✅ Arrancar servidor
// ---------------------------------------------------------
const PORT = process.env.PORT || 4000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Digital Bakery en puerto ${PORT}`);
  });
});
