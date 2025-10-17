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

// Funktion för att hämta alla anteckningar för en specifik deltagare
const getAllNotesByParticipant = async (participantId) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE participant_id = $1 ORDER BY date DESC', [participantId]);
    return result.rows;
  } catch (err) {
    console.error('Kunde inte hämta anteckningar', err);
    throw err;
  }
};

// Funktion för att hämta den senaste anteckningen för en specifik deltagare
const getLatestNoteByParticipant = async (participantId) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE participant_id = $1 ORDER BY date DESC LIMIT 1', [participantId]);
    return result.rows[0];
  } catch (err) {
    console.error('Kunde inte hämta den senaste anteckningen', err);
    throw err;
  }
};

// Funktion för att spara en ny anteckning för en deltagare
const saveNote = async (participantId, author, content) => {
  try {
    const query = 'INSERT INTO notes (participant_id, author, content, date) VALUES ($1, $2, $3, NOW()) RETURNING *';
    const values = [participantId, author, content];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error('Kunde inte spara anteckning', err);
    throw err;
  }
};

module.exports = { getAllNotesByParticipant, getLatestNoteByParticipant, saveNote };
