const { Pool } = require('pg');
require('dotenv').config();

// Kontrollera att alla miljövariabler finns
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Saknad miljövariabel: ${varName}`);
    process.exit(1);
  }
}

// PostgreSQL-anslutning
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Modellklass
class FollowUp {
  // Skapa en ny uppföljning med created_by och participant_id
  static async createFollowUp({
    fromName,
    fromEmail,
    toEmail,
    subject,
    message,
    date,
    startTime,
    endTime,
    location,
    created_by,
    participant_id
  }) {
    const query = `
      INSERT INTO followups 
        (from_name, from_email, to_email, subject, message, date, start_time, end_time, location, created_by, participant_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      fromName,
      fromEmail,
      toEmail,
      subject,
      message,
      date,
      startTime,
      endTime,
      location,
      created_by,
      participant_id
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (err) {
      console.error('❌ Fel vid skapande av uppföljning:', err);
      throw new Error('Kunde inte skapa uppföljning.');
    }
  }

  // Hämta alla uppföljningar
  static async getAllFollowUps() {
    try {
      const result = await pool.query('SELECT * FROM followups ORDER BY date DESC');
      return result.rows;
    } catch (err) {
      console.error('❌ Fel vid hämtning av alla uppföljningar:', err);
      throw new Error('Kunde inte hämta uppföljningar.');
    }
  }

  // Hämta uppföljningar för specifik mottagare (e-post)
  static async getFollowUpsByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM followups WHERE to_email = $1 ORDER BY date DESC',
        [email]
      );
      return result.rows;
    } catch (err) {
      console.error('❌ Fel vid hämtning av uppföljningar via e-post:', err);
      throw new Error('Kunde inte hämta uppföljningar för angiven e-post.');
    }
  }

  // Hämta uppföljningar för specifik deltagare (via participant_id)
  static async getFollowUpsByParticipantId(participantId) {
    try {
      const result = await pool.query(
        'SELECT * FROM followups WHERE participant_id = $1 ORDER BY date ASC',
        [participantId]
      );
      return result.rows;
    } catch (err) {
      console.error('❌ Fel vid hämtning av uppföljningar via participant_id:', err);
      throw new Error('Kunde inte hämta uppföljningar för angiven deltagare.');
    }
  }
}

module.exports = FollowUp;
