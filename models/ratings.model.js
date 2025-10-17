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

class Rating {
  constructor(userId, ratings) {
    this.userId = userId;
    this.hantering_av_vardagen = ratings.hantering_av_vardagen;
    this.hälsa = ratings.hälsa;
    this.koncentrationsförmåga = ratings.koncentrationsförmåga;
    this.tro_på_att_få_jobb = ratings.tro_på_att_få_jobb;
    this.stöd_från_nätverk = ratings.stöd_från_nätverk;
    this.samarbetsförmåga = ratings.samarbetsförmåga;
    this.jobbsökningsbeteende = ratings.jobbsökningsbeteende;
    this.kunskap_om_arbetsmarknaden = ratings.kunskap_om_arbetsmarknaden;
    this.målmedvetenhet = ratings.målmedvetenhet;
  }

  // Spara rating till databasen
  static async save(userId, ratings) {
    const query = `
      INSERT INTO ratings (user_id, hantering_av_vardagen, hälsa, koncentrationsförmåga, 
                           tro_på_att_få_jobb, stöd_från_nätverk, samarbetsförmåga, 
                           jobbsökningsbeteende, kunskap_om_arbetsmarknaden, målmedvetenhet, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *;
    `;
    const values = [
      userId,
      ratings.hantering_av_vardagen,
      ratings.hälsa,
      ratings.koncentrationsförmåga,
      ratings.tro_på_att_få_jobb,
      ratings.stöd_från_nätverk,
      ratings.samarbetsförmåga,
      ratings.jobbsökningsbeteende,
      ratings.kunskap_om_arbetsmarknaden,
      ratings.målmedvetenhet,
    ];

    try {
      const result = await pool.query(query, values);
      console.log("✅ Rating sparades:", result.rows[0]);
      return result.rows[0]; // Returnera den sparade raden
    } catch (error) {
      console.error("❌ Fel vid sparande av rating:", error);
      throw error;
    }
  }

  // Hämta den senaste ratingen för en användare
  static async getByUserId(userId) {
    const query = 'SELECT * FROM ratings WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1;';
    try {
      const result = await pool.query(query, [userId]);
      if (result.rows.length === 0) {
        console.log('❌ Ingen rating hittades för användaren.');
        return null;
      }
      return result.rows[0]; // Returnera den senaste ratingen
    } catch (error) {
      console.error("❌ Fel vid hämtning av rating:", error);
      throw error;
    }
  }

  // Hämta den första ratingen för en användare
  static async getFirstByUserId(userId) {
    const query = 'SELECT * FROM ratings WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1;';
    try {
      const result = await pool.query(query, [userId]);
      if (result.rows.length === 0) {
        console.log('❌ Ingen första rating hittades för användaren.');
        return null;
      }
      return result.rows[0]; // Returnera den första ratingen
    } catch (error) {
      console.error("❌ Fel vid hämtning av första rating:", error);
      throw error;
    }
  }

  // Hämta både första och senaste ratingen för en användare
  static async getFirstAndLatestByUserId(userId) {
    try {
      const firstRating = await Rating.getFirstByUserId(userId);
      const latestRating = await Rating.getByUserId(userId);

      if (!firstRating || !latestRating) {
        console.log('❌ Kunde inte hitta både första och senaste ratingen.');
        return null;
      }

      return { firstRating, latestRating };
    } catch (error) {
      console.error("❌ Fel vid hämtning av första och senaste rating:", error);
      throw error;
    }
  }

  // Hämta alla ratingar för en användare
  static async getAllByUserId(userId) {
    const query = 'SELECT * FROM ratings WHERE user_id = $1 ORDER BY created_at ASC;';
    try {
      const result = await pool.query(query, [userId]);
      if (result.rows.length === 0) {
        console.log('❌ Ingen rating hittades för användaren.');
        return null;
      }
      return result.rows; // Returnera alla ratingar för användaren
    } catch (error) {
      console.error("❌ Fel vid hämtning av alla ratings:", error);
      throw error;
    }
  }
}

// Exportera klassen
module.exports = Rating;
