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

// Skapa ett nytt meddelande
const createMessage = async (participantId, sender, text) => {
  const query = `
    INSERT INTO messages (participant_id, sender, text, read_status)
    VALUES ($1, $2, $3, false)
    RETURNING id, sender, text, timestamp, read_status;
  `;
  const values = [participantId, sender, text];
  const result = await pool.query(query, values);  // Använd pool.query istället för db.query
  return result.rows[0];
};

// Hämtar meddelanden för en viss deltagare och markerar dem som lästa
const getMessagesByParticipant = async (participantId) => {
  const query = `
    SELECT id, sender, text, timestamp, read_status
    FROM messages
    WHERE participant_id = $1
    ORDER BY timestamp ASC;
  `;
  const values = [participantId];
  const result = await pool.query(query, values);  // Använd pool.query istället för db.query
  
  // Markera alla meddelanden som lästa när de hämtas
  await markMessagesAsRead(participantId);
  
  return result.rows;
};

// Uppdatera meddelandets lässtatus till 'true' när det hämtas
const markMessagesAsRead = async (participantId) => {
  const query = `
    UPDATE messages
    SET read_status = true
    WHERE participant_id = $1 AND read_status = false;
  `;
  const values = [participantId];
  await pool.query(query, values);  // Använd pool.query istället för db.query
};

// Hämtar alla meddelanden för alla deltagare (utan att markera som lästa)
const getAllMessages = async () => {
  const query = `
    SELECT id, participant_id, sender, text, timestamp, read_status
    FROM messages
    ORDER BY timestamp ASC;
  `;
  const result = await pool.query(query);  // Använd pool.query istället för db.query
  return result.rows;
};

module.exports = {
  createMessage,
  getMessagesByParticipant,
  getAllMessages,
};
