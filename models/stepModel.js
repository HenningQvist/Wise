const { Pool } = require("pg");
require("dotenv").config(); // Ladda miljövariabler från .env-fil

// Kontrollera om alla nödvändiga miljövariabler finns
const requiredEnvVars = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASS", "DB_PORT", "JWT_SECRET"];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing environment variable: ${varName}`);
    process.exit(1); // Avsluta processen om en nödvändig miljövariabel saknas
  } else {
    console.log(`✅ Environment variable ${varName} loaded correctly.`);
  }
}

// PostgreSQL-anslutning med miljövariabler
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Testa databasanslutningen vid uppstart
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("🔹 PostgreSQL connection established successfully");
    client.release(); // Frigör klienten tillbaka till poolen
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL:", error);
    process.exit(1); // Avsluta om anslutningen misslyckas
  }
};

// 🟢 **Spara deltagarens valda steg + användarnamn i databasen**
const saveStep = async (participantId, step, username) => {
  const query = `
    INSERT INTO user_steps (participant_id, step, username)
    VALUES ($1, $2, $3)
    ON CONFLICT (participant_id) 
    DO UPDATE SET step = EXCLUDED.step, username = EXCLUDED.username;
  `;

  try {
    await pool.query(query, [participantId, step, username]);
    console.log(`✅ Step ${step} saved for participant ${participantId} by ${username}`);
  } catch (error) {
    console.error(`❌ Error saving step for participant ${participantId} by ${username}:`, error);
  }
};

// 🟢 **Hämta deltagarens valda steg**
const getStep = async (participantId) => {
  const query = "SELECT step, username FROM user_steps WHERE participant_id = $1";
  try {
    const result = await pool.query(query, [participantId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error(`❌ Error retrieving step for participant ${participantId}:`, error);
    return null;
  }
};

// 🟢 **Hämta alla deltagares steg**
const getAllSteps = async () => {
  const query = "SELECT participant_id, step, created_at, username, avslutad FROM user_steps";
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("❌ Error retrieving all steps:", error);
    return [];
  }
};


// Kör testanslutningen vid uppstart
testConnection();

module.exports = { saveStep, getStep, getAllSteps };
