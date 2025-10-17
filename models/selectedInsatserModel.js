// models/selectedInsatserModel.js

const { Pool } = require('pg');
require('dotenv').config();  // Ladda miljövariabler från .env

// Kontrollera att alla nödvändiga miljövariabler finns
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Saknad miljövariabel: ${varName}`);
    process.exit(1);  // Avsluta processen om en miljövariabel saknas
  } else {
    console.log(`✅ Miljövariabel ${varName} är laddad korrekt.`);
  }
}

// Skapa en PostgreSQL anslutning med miljövariabler
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

console.log('🔹 PostgreSQL anslutning skapad med följande konfiguration:');
console.log(`User: ${process.env.DB_USER}, Host: ${process.env.DB_HOST}, Database: ${process.env.DB_NAME}`);


const saveSelectedInsatser = async (participantId, step, selectedInsatser) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // Starta en transaktion

    const insertQuery = `
      INSERT INTO selected_insatser 
      (participant_id, step, insats_id, name, focus_type, description, combine_with, start_date, end_date, last_date, responsible) 
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const insertedRows = [];

    for (const insats of selectedInsatser) {
      const values = [
        participantId,
        step,
        insats.id,
        insats.name,
        insats.focus_type,
        insats.description,
        insats.combine_with,
        insats.start_date,
        insats.end_date,
        insats.last_date,
        insats.responsible
      ];
      const result = await client.query(insertQuery, values);
      insertedRows.push(result.rows[0]);
    }

    await client.query('COMMIT'); // Bekräfta transaktionen
    return insertedRows;
  } catch (err) {
    await client.query('ROLLBACK'); // Ångra ändringar vid fel
    throw err;
  } finally {
    client.release();
  }
};



const getSelectedInsatser = async (participantId) => {
  const query = `
    SELECT * FROM selected_insatser
    WHERE participant_id = $1;
  `;
  const result = await pool.query(query, [participantId]);
  return result.rows; // Returnera alla rader som en array
};

const getAllSelectedInsatser = async () => {
  const query = `
    SELECT * FROM selected_insatser;
  `;
  const result = await pool.query(query);
  return result.rows; // Returnera alla rader som en array
};

module.exports = {
  saveSelectedInsatser,
  getSelectedInsatser,
  getAllSelectedInsatser,
};
