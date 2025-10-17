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

const registerParticipant = async (participantData) => {
  const {
    firstName,
    lastName,
    gender,
    educationLevel,
    license,
    personalNumber,
    address,
    postalCode,
    city,
    phoneNumber,
    unemploymentTime,
    initiatedBy,
    createdBy
  } = participantData;

  // Validering
  if (
    !firstName || !lastName || !gender || !educationLevel || !phoneNumber ||
    !personalNumber || !address || !postalCode || !city || !unemploymentTime || !initiatedBy
  ) {
    throw new Error('Some required fields are missing');
  }

  // SQL-query som inkluderar unemploymentTime & initiatedBy
  const query = `
    INSERT INTO participants (
      firstName, lastName, gender, education, license, personalNumber,
      address, postalCode, city, phoneNumber,
      unemploymentTime, initiatedBy, createdBy
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id;
  `;

  const values = [
    firstName,
    lastName,
    gender,
    educationLevel,
    license,
    personalNumber,
    address,
    postalCode,
    city,
    phoneNumber,
    unemploymentTime,
    initiatedBy,
    createdBy
  ];

  console.log('🔹 SQL-fråga för att registrera deltagare:', query);
  console.log('🔹 Värden som skickas till databasen:', values);

  try {
    const res = await pool.query(query, values);
    console.log('✅ Deltagare registrerad, nytt ID:', res.rows[0].id);
    return res.rows[0];
  } catch (err) {
    console.error('❌ Fel vid SQL-fråga:', err.message);
    throw new Error('Error registering participant');
  }
};

// Funktion för att hämta deltagare som skapades av en specifik handläggare och som inte är avslutade
const getParticipants = async (createdBy) => {
  const query = `
    SELECT * FROM participants
    WHERE createdBy = $1
    AND avslutad_av IS NULL
    ORDER BY created_at DESC
  `;

  try {
    const res = await pool.query(query, [createdBy]);
    console.log('✅ Aktiva deltagare hämtade:', res.rows);
    return res.rows;
  } catch (err) {
    console.error('❌ Fel vid hämtning av deltagare:', err.message);
    throw new Error('Error fetching participants');
  }
};

const avslutaParticipant = async (id, reason, avslutadAv) => {
  const query = `
    UPDATE participants
    SET avslutad = TRUE,
        avslutsorsak = $1,
        avslutad_av = $2,
        avslutad_datum = NOW()
    WHERE id = $3
    RETURNING *;
  `;
  const values = [reason, avslutadAv, id];

  const result = await pool.query(query, values);
  return result.rows[0]; // returnerar uppdaterad deltagare eller null
};
// Stäng anslutning till PostgreSQL när applikationen stängs
process.on('exit', () => {
  console.log('🔹 Stänger PostgreSQL anslutning.');
  pool.end();
});



module.exports = { registerParticipant, getParticipants, avslutaParticipant }; // Exportera funktionerna
