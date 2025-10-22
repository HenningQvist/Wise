const { Pool } = require('pg');
const env = require('./env.js'); // Centraliserade miljövariabler

// Konvertera DB_PORT till nummer med fallback
const dbPort = (() => {
  const port = Number(env.DB_PORT);
  if (isNaN(port)) {
    console.warn('⚠️ Ogiltig DB_PORT:', env.DB_PORT, '– använder standard 5432');
    return 5432;
  }
  return port;
})();

// Skapa PostgreSQL-pool
const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASS,
  port: dbPort,
  max: 20, // Max antal klienter i poolen (kan justeras)
  idleTimeoutMillis: 30000, // Stänger inaktiva klienter efter 30 sek
  connectionTimeoutMillis: 2000, // Timeout vid anslutning
});

// Testa databasanslutning
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL är ansluten');
    client.release(); // Släpp klienten tillbaka till poolen
  } catch (err) {
    console.error('⛔ Fel vid anslutning till PostgreSQL:', err.message);
  }
})();

// Hantera avslut av server och pool
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('🛑 Databasanslutning stängd');
    process.exit(0);
  } catch (err) {
    console.error('❌ Fel vid stängning av pool:', err.message);
    process.exit(1);
  }
});

module.exports = pool;
