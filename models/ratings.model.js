const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

class Rating {
  constructor(userId, ratings) {
    this.userId = userId;
    this.hantering_av_vardagen = ratings.hantering_av_vardagen || null;
    this.hälsa = ratings.hälsa || null;
    this.koncentrationsförmåga = ratings.koncentrationsförmåga || null;
    this.tro_på_att_få_jobb = ratings.tro_på_att_få_jobb || null;
    this.stöd_från_nätverk = ratings.stöd_från_nätverk || null;
    this.samarbetsförmåga = ratings.samarbetsförmåga || null;
    this.jobbsökningsbeteende = ratings.jobbsökningsbeteende || null;
    this.kunskap_om_arbetsmarknaden = ratings.kunskap_om_arbetsmarknaden || null;
    this.målmedvetenhet = ratings.målmedvetenhet || null;
  }

  // Spara rating
  static async save(userId, ratings) {
    const query = `
      INSERT INTO ratings (
        user_id, hantering_av_vardagen, hälsa, koncentrationsförmåga,
        tro_på_att_få_jobb, stöd_från_nätverk, samarbetsförmåga,
        jobbsökningsbeteende, kunskap_om_arbetsmarknaden, målmedvetenhet, created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
      RETURNING *;
    `;
    const values = [
      userId,
      ratings.hantering_av_vardagen || null,
      ratings.hälsa || null,
      ratings.koncentrationsförmåga || null,
      ratings.tro_på_att_få_jobb || null,
      ratings.stöd_från_nätverk || null,
      ratings.samarbetsförmåga || null,
      ratings.jobbsökningsbeteende || null,
      ratings.kunskap_om_arbetsmarknaden || null,
      ratings.målmedvetenhet || null,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Fel vid sparande av rating:', error);
      throw error;
    }
  }

  // Hämta senaste rating
  static async getByUserId(userId) {
    const query = `
      SELECT * FROM ratings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Fel vid hämtning av senaste rating:', error);
      throw error;
    }
  }

  // Hämta första rating
  static async getFirstByUserId(userId) {
    const query = `
      SELECT * FROM ratings
      WHERE user_id = $1
      ORDER BY created_at ASC
      LIMIT 1;
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Fel vid hämtning av första rating:', error);
      throw error;
    }
  }

  // Hämta alla ratings
  static async getAllByUserId(userId) {
    const query = `
      SELECT * FROM ratings
      WHERE user_id = $1
      ORDER BY created_at ASC;
    `;
    try {
      const result = await pool.query(query, [userId]);
      return result.rows || [];
    } catch (error) {
      console.error('❌ Fel vid hämtning av alla ratings:', error);
      throw error;
    }
  }
}

module.exports = Rating;
