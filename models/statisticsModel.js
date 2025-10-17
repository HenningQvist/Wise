const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config(); // Ladda miljövariabler från .env

// Kontrollera att alla miljövariabler finns
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Saknad miljövariabel: ${varName}`);
    process.exit(1);
  }
}

// PostgreSQL anslutning
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Funktion för att hämta användare med filtrering (om behov)
const getUsers = async (filters) => {
  try {
    // Exempel på parametriserad fråga, använd filters om de finns
    const query = 'SELECT * FROM users WHERE username LIKE $1';
    const values = [filters.username || '%'];

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Funktion för att hämta steg (steps) med filtrering (om behov)
const getSteps = async (filters) => {
  try {
    let query = `
      SELECT * FROM user_steps 
      WHERE participant_id = $1
    `;
    const values = [filters.participantId];

    if (filters.startDate && filters.endDate) {
      query += ` AND created_at BETWEEN $2 AND $3`;
      values.push(filters.startDate, filters.endDate);
    }

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
};


// Funktion för att hämta deltagare baserat på filtrering
const getAllParticipants = async ({ startDate, endDate, status }) => {
  try {
    let query = 'SELECT * FROM participants WHERE 1=1';
    const params = [];

    // Filtrera på start- och slutdatum (kontrollerar created_at OCH avslutad_datum)
    if (startDate) {
      query += ` AND (
        (created_at >= $1)
        OR (avslutad = true AND avslutad_datum >= $2)
      )`;
      params.push(startDate, startDate);
    }

    if (endDate) {
      query += ` AND (
        (created_at <= $3)
        OR (avslutad = true AND avslutad_datum <= $4)
      )`;
      params.push(endDate, endDate);
    }

    // Filtrera på avslutsstatus om angivet
    if (status === 'avslutad') {
      query += ' AND avslutad = true';
    } else if (status === 'pågående') {
      query += ' AND avslutad = false';
    }

    // Kör frågan med parametrar
    const result = await pool.query(query, params);

    return result.rows;
  } catch (error) {
    console.error('Error in getAllParticipants:', error);
    throw error;
  }
};

module.exports = { getUsers, getSteps, getAllParticipants };
