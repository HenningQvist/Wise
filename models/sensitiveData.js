const { Pool } = require('pg');
require('dotenv').config();  // Ladda miljövariabler från .env

// Kontrollera att alla miljövariabler finns
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Saknad miljövariabel: ${varName}`);
    process.exit(1);  // Avsluta processen om en miljövariabel saknas
  } else {
    console.log(`✅ Miljövariabel ${varName} är laddad korrekt.`);
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

console.log('🔹 PostgreSQL anslutning skapad med följande konfiguration:');
console.log(`User: ${process.env.DB_USER}, Host: ${process.env.DB_HOST}, Database: ${process.env.DB_NAME}`);

// Funktion för att spara kartläggning för en deltagare
const saveSensitiveData = async (participantId, data) => {
  try {
    const result = await pool.query(
      `INSERT INTO sensitive_data 
        (participant_id, grundläggande_uppgifter, hantering_av_vardagen, hälsa, koncentrationsförmåga, tro_på_att_få_jobb, stöd_från_nätverk, samarbetsförmåga, jobbsökningsbeteende, kunskap_om_arbetsmarknaden, målmedvetenhet) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
      [
        participantId,
        data.grundläggande_uppgifter,
        data.hantering_av_vardagen,
        data.hälsa,
        data.koncentrationsförmåga,
        data.tro_på_att_få_jobb,
        data.stöd_från_nätverk,
        data.samarbetsförmåga,
        data.jobbsökningsbeteende,
        data.kunskap_om_arbetsmarknaden,
        data.målmedvetenhet,
      ]
    );
    return result.rows[0]; // Returnera den nyss skapade kartläggningen
  } catch (error) {
    console.error('Error saving sensitive data:', error);
    throw new Error('Error saving sensitive data');
  }
};

// Funktion för att hämta den senaste kartläggningen för en deltagare
const getLatestSensitiveData = async (participantId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sensitive_data WHERE participant_id = $1 ORDER BY created_at DESC LIMIT 1',
      [participantId]
    );
    return result.rows[0]; // Returnera den senaste kartläggningen
  } catch (error) {
    console.error('Error fetching sensitive data:', error);
    throw new Error('Error fetching sensitive data');
  }
};

module.exports = {
  saveSensitiveData,
  getLatestSensitiveData,
};
