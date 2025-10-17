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

// Funktion för att skapa eller uppdatera beslut i selected_insatser
const updateDecision = async (data) => {
  const {
    participantId,
    insatsId,
    bestallare,
    insats,
    beslut,
    startDate,
    endDate,
    executor,
    workplace,
    ansvarig,
    handledare,
    telefon,
    kategori // <- Lägg till kategori här
  } = data;

  try {
    const result = await pool.query(
      `UPDATE selected_insatser 
       SET bestallare = $1, 
           insats = $2, 
           beslut = $3, 
           start_date = $4, 
           end_date = $5, 
           executor = $6, 
           workplace = $7, 
           ansvarig = $8, 
           handledare = $9, 
           telefon = $10, 
           kategori = $11  -- Lägg till denna
       WHERE participant_id = $12 AND insats_id = $13
       RETURNING *`,
      [
        bestallare,
        insats,
        beslut,
        startDate,
        endDate,
        executor,
        workplace,
        ansvarig,
        handledare,
        telefon,
        kategori,      // <- kategori här
        participantId,
        insatsId,
      ]
    );

    return result.rows[0]; // Retur av den uppdaterade raden
  } catch (error) {
    console.error('Error updating decision in database:', error);
    throw error;
  }
};


// Funktion för att hämta beslut för en specifik deltagare och insats
const getDecisionsByParticipantAndInsats = async (participantId, insatsId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM selected_insatser WHERE participant_id = $1 AND insats_id = $2',
      [participantId, insatsId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching decisions from database:', error);
    throw error;
  }
};

// Funktion för att hämta alla beslut
const getAllDecisions = async () => {
  try {
    const result = await pool.query('SELECT * FROM selected_insatser');
    return result.rows;
  } catch (error) {
    console.error('Error fetching decisions from database:', error);
    throw error;
  }
};

const endInsats = async (insatsId, participantId, endingStatus) => {
  try {
    // Logga insatsId och participantId för att kontrollera att rätt värden skickas
    console.log(`Försöker uppdatera insatsen med insatsId: ${insatsId}, participantId: ${participantId}`);
    
    const result = await pool.query(
      `UPDATE selected_insatser 
       SET avslutad_status = $1, avslutningsdatum = NOW() 
       WHERE id = $2 AND participant_id = $3
       RETURNING *`,
      [endingStatus, insatsId, participantId]
    );

    if (result.rowCount === 0) {
      // Logga resultatet när ingen rad uppdateras
      console.log('Ingen insats hittades eller insatsen är redan avslutad.');
      throw new Error('Insatsen hittades inte eller är redan avslutad.');
    }

    console.log('Insatsen har uppdaterats:', result.rows[0]); // Logga den uppdaterade insatsen
    return result.rows[0];  // Retur av den uppdaterade raden
  } catch (error) {
    console.error('Error ending insats in database:', error);
    throw error;
  }
};


module.exports = {
  updateDecision,
  getDecisionsByParticipantAndInsats,
  getAllDecisions,
  endInsats,  // Exportera den nya funktionen
};
