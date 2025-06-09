// scripts/createAdmin.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('../src/config/database');
const User = require('../src/models/User');

async function createAdmin() {
  await sequelize.sync();

  const email = 'admin@bakery.com';
  const password = 'admin123';
  const name = 'Administrador';

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log('Admin ya existe.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
  });

  console.log('✅ Admin creado correctamente');
  process.exit();
}

createAdmin();
