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

// Funktion för att skapa en ny insats
const createInsats = async (insatsData) => {
  const {
    name, focusType, description, combineWith,
    insatsType1, insatsType2, insatsType3, insatsType4, insatsType5,
    startDate, endDate, lastDate, responsible
  } = insatsData;

  // Konvertera tomma strängar till null för datumen
  const safeStartDate = startDate ? startDate : null;
  const safeEndDate = endDate ? endDate : null;
  const safeLastDate = lastDate ? lastDate : null;

  try {
    const result = await pool.query(`
      INSERT INTO insatser (name, focus_type, description, combine_with, 
                            insats_type1, insats_type2, insats_type3, 
                            insats_type4, insats_type5, start_date, end_date, 
                            last_date, responsible)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id;
    `, [
      name, focusType, description, combineWith, 
      insatsType1, insatsType2, insatsType3, insatsType4, insatsType5, 
      safeStartDate, safeEndDate, safeLastDate, responsible
    ]);

    return result.rows[0].id;
  } catch (error) {
    console.error('❌ Fel vid skapande av insats:', error.message);
    throw error;
  }
};

// Funktion för att lägga till filer för en insats
const addFilesToInsats = async (insatsId, files) => {
  try {
    const filePromises = files.map(file =>
      pool.query(`
        INSERT INTO files (insats_id, file_name, file_path)
        VALUES ($1, $2, $3);
      `, [insatsId, file.originalname, file.path])
    );

    // Vänta på att alla filer ska sparas
    await Promise.all(filePromises);
  } catch (error) {
    console.error('❌ Fel vid lagring av filer:', error.message);
    throw error;
  }
};

const getAllInsatser = async () => {
  try {
    const query = `
      SELECT 
        i.*, 
        COALESCE(json_agg(json_build_object(
          'file_name', f.file_name, 
          'file_path', f.file_path
        )) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
      FROM insatser i
      LEFT JOIN files f ON i.id = f.insats_id
      GROUP BY i.id;
    `;

    const result = await pool.query(query);
    return result.rows; // Returnerar alla insatser inklusive deras filer
  } catch (error) {
    console.error('❌ Fel vid hämtning av insatser från databasen:', error.message);
    throw error;
  }
};


module.exports = {
  getAllInsatser,
  createInsats,
  addFilesToInsats
  
};
