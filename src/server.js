// src/server.js

require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');

// Modelos
const Product = require('./models/Product');
require('./models/Customer');
require('./models/Order');
require('./models/OrderItem');
require('./models/User');

// Rutas
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');

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

// CORS dinámico
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
app.use('/api/auth',     authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);

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