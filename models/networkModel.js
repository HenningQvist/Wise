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

// Hämta nätverk för en viss deltagare baserat på participantId
const getNetworkByParticipant = async (participantId) => {
  try {
    const result = await pool.query(
      "SELECT * FROM network_nodes WHERE participant_id = $1", 
      [participantId]
    );
    return result.rows;  // Returnerar nätverksdata för den specifika deltagaren
  } catch (err) {
    console.error("Fel vid hämtning av nätverk:", err);
    throw new Error("Fel vid hämtning från databasen.");
  }
};

async function saveNetwork(participantId, nodes) {
  try {
    // Radera befintliga noder för deltagaren
    await pool.query("DELETE FROM network_nodes WHERE participant_id = $1", [participantId]);

    // Lägg till nya noder
    for (const node of nodes) {
      const { id, label, icon, color, x, y } = node;

      await pool.query(
        "INSERT INTO network_nodes (id, participant_id, label, icon, color, x, y) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, participantId, label, icon, color, x, y]
      );
    }

    return { success: true };
  } catch (err) {
    console.error("Fel vid sparande i databasen:", err);
    throw err;
  }
}


module.exports = {
  getNetworkByParticipant,
  saveNetwork,
};
