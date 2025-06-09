// test-db.js
// Prueba de conexión con PostgreSQL usando Sequelize, sin fallar si no devuelve tabla alguna.

require('dotenv').config();
const { Sequelize } = require('sequelize');

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASS
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false, // evita imprimir cada query
});

(async () => {
  try {
    // 1) Autenticar con la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa a la base de datos.');

    // 2) Intentar listar algunas tablas, pero sin que falle si no vienen resultados
    const [queryResult, meta] = await sequelize.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       ORDER BY table_name;`
    );

    if (Array.isArray(queryResult)) {
      const tablas = queryResult.map(r => r.table_name);
      console.log('Tablas en public:', tablas.length ? tablas : '(ninguna)');
    } else {
      console.log('Nota: no se obtuvo lista de tablas (quizá no hay ninguna).');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Ocurrió un error al conectar o listar tablas:', error);
    process.exit(1);
  }
})();
