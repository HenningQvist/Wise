const { Pool } = require('pg');
const dotenv = require('dotenv');

// 🌱 Ladda .env lokalt
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('🌱 Miljövariabler laddade från .env');
}

// ✅ Skapa PostgreSQL-pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
  // 🔹 Säkerställ att vi alltid använder public-schema
  options: '-c search_path=public'
});

// ✅ Testa anslutning
pool.connect()
  .then(() => console.log('✅ PostgreSQL är ansluten'))
  .catch(err => console.error('⛔ Fel vid anslutning:', err.message));

// ✅ Stäng pool vid processavslut
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Databasanslutning stängd');
    process.exit(0);
  });
});

module.exports = pool;
