const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const env = require('./env.js');  // Importera miljövariabler



const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432, // Använd port från .env eller standard 5432
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

