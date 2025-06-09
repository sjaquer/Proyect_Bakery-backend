// config/database.js

const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.DATABASE_URL) {
  // En producción (Railway) usará DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Acepta certificados autofirmados
      }
    },
  });
  console.log('🔌 Conectando a PostgreSQL via DATABASE_URL');
} else {
  // En desarrollo local usa variables separadas en .env
  const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASS,
  } = process.env;

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false, // Puedes habilitar true para ver SQL en consola
  });
  console.log('🔌 Conectando a PostgreSQL local');
}

module.exports = sequelize;
