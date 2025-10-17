const { Pool } = require('pg');
require('dotenv').config();  // Ladda miljövariabler från .env

// Kontrollera att alla miljövariabler finns
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Saknad miljövariabel: ${varName}`);
    process.exit(1);  // Avsluta processen om en miljövariabel saknas
  }
}

// PostgreSQL anslutning med miljövariabler
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

console.log('🔹 PostgreSQL anslutning skapad.');

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS tips (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    url TEXT,
    expire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

pool.query(createTableQuery)
  .then(() => console.log('✅ Tips-tabell redo'))
  .catch(err => console.error('❌ Fel vid skapande av tabell:', err));

module.exports = {
  async addTip(text, url, expireDate) {
    const result = await pool.query(
      'INSERT INTO tips (text, url, expire_date) VALUES ($1, $2, $3) RETURNING *',
      [text, url, expireDate]
    );
    return result.rows[0];
  },

  async getTips() {
    const result = await pool.query('SELECT * FROM tips WHERE expire_date >= CURRENT_DATE');
    return result.rows;
  },

  async deleteTip(id) {
    await pool.query('DELETE FROM tips WHERE id = $1', [id]);
    return { message: 'Tip borttaget' };
  }
};
