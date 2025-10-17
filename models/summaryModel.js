// models/summaryModel.js
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

const saveSummary = async (participantId, summary) => {
  const query = `
    INSERT INTO participant_summaries (participant_id, summary)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [participantId, summary];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getLatestSummary = async (participantId) => {
  const query = `
    SELECT * FROM participant_summaries
    WHERE participant_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await pool.query(query, [participantId]);
  return result.rows[0];
};

module.exports = {
  saveSummary,
  getLatestSummary,
};
