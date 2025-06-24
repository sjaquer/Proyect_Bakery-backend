// Este script poblará la base de datos con algunos productos de ejemplo.
// Se puede ejecutar con: `npm run seed`

require('dotenv').config();
const sequelize = require('../src/config/database');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');

const seedProducts = [
  {
    name: 'Concha Tradicional',
    description: 'Concha dulce de vainilla con cubierta crujiente.',
    price: 1.50,
    stock: 100,
    category: 'sweet',
    imageUrl: '',
    featured: true,
  },
  {
    name: 'Bolillo Blanco',
    description: 'Bolillo fresco, ideal para acompañar cualquier platillo.',
    price: 0.50,
    stock: 200,
    category: 'bread',
    imageUrl: '',
    featured: false,
  },
  {
    name: 'Pan de Muerto',
    description: 'Pan de muerto tradicional, suave y esponjoso.',
    price: 2.00,
    stock: 50,
    category: 'special',
    imageUrl: '',
    featured: false,
  },
  {
    name: 'Pan Integral',
    description: 'Pan de trigo integral, saludable y nutritivo.',
    price: 1.75,
    stock: 80,
    category: 'bread',
    imageUrl: '',
    featured: false,
  },
  {
    name: 'Donut Chocolate',
    description: 'Donut cubierto de chocolate con chispas.',
    price: 1.25,
    stock: 120,
    category: 'sweet',
    imageUrl: '',
    featured: false,
  },
];

const seed = async () => {
  try {
    // 1) Sincronizar modelos (forzar borrado de tablas si existen)
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos reseteada (force: true)');

    // 2) Insertar productos
    const createdProducts = await Product.bulkCreate(seedProducts);
    console.log(`✅ ${createdProducts.length} productos insertados.`);

    // 3) Crear usuario admin de prueba
    const passwordAdmin = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordAdmin, salt);
    const adminUser = await User.create({
      name: 'Admin Principal',
      email: 'admin@bakery.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log(`✅ Usuario admin creado: email=admin@bakery.com  password=${passwordAdmin}`);

    console.log('🎉 Seed completado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed.js:', error);
    process.exit(1);
  }
};

seed();
