const { Pool } = require('pg');
const env = require('./env.js');  // Importera centraliserade miljövariabler

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASS,
  port: (() => {
    const port = Number(env.DB_PORT);
    if (isNaN(port)) {
      console.error('❌ Ogiltig DB_PORT:', env.DB_PORT, '– använder standard 5432');
      return 5432;
    }
    return port;
  })(),
});

// Testa databasanslutning
pool.connect()
  .then(() => console.log('✅ PostgreSQL är ansluten'))
  .catch(err => console.error('⛔ Fel vid anslutning:', err.message));

process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Databasanslutning stängd');
    process.exit(0);
  });
});

module.exports = pool;
