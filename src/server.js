// src/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');

// Modelos
const Product = require('./models/Product');
require('./models/Customer');
require('./models/Order');
require('./models/OrderItem');
require('./models/User');

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);


const app = express();

// ----------------------
// CORS dinámico
// ----------------------
const corsOrigins = [/\.vercel\.app$/, /\.onrender\.com$/];
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (corsOrigins.some(rx => rx.test(origin))) return cb(null, true);
    return cb(new Error('CORS no permitido'), false);
  },
  credentials: true
}));

app.use(bodyParser.json());

// Ruta raíz
app.get('/', (req, res) => res.send('🎉 API Digital Bakery corriendo'));

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Semilla de productos si la tabla está vacía
async function seedProductsIfEmpty() {
  const count = await Product.count();
  if (count === 0) {
    const sample = [
      { name: 'Concha Tradicional', description: 'Concha dulce de vainilla con cubierta crujiente.', price: 1.5, stock: 100, category: 'sweet', imageUrl: '' },
      { name: 'Pan de Muerto',      description: 'Pan de muerto tradicional, suave y esponjoso.', price: 2.0, stock: 50,  category: 'special', imageUrl: '' },
      { name: 'Donut Chocolate',    description: 'Donut cubierto de chocolate con chispas.', price: 1.25, stock: 120, category: 'sweet', imageUrl: '' },
      { name: 'Bolillo Blanco',     description: 'Bolillo fresco, ideal para acompañar cualquier platillo.', price: 0.5, stock: 197,  category: 'bread', imageUrl: '' },
      { name: 'Pan Integral',       description: 'Pan de trigo integral, saludable y nutritivo.', price: 1.75, stock: 80,  category: 'bread', imageUrl: '' },
    ];
    for (const p of sample) {
      await Product.create(p);
    }
    console.log(`✅ Seed: ${sample.length} productos creados`);
  } else {
    console.log(`ℹ️ No seed necesario. Productos existentes: ${count}`);
  }
}

// Arrancar servidor tras sync y seed
const PORT = process.env.PORT || 4000;
sequelize.sync()
  .then(async () => {
    await seedProductsIfEmpty();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al sincronizar DB:', err);
  });
