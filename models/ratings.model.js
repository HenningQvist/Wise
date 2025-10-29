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
  constructor(participantId, ratings) {
    this.participant_id = participantId;
    this.hantering_av_vardagen = ratings.hantering_av_vardagen || null;
    this.halsa = ratings.halsa || null;
    this.koncentrationsformaga = ratings.koncentrationsformaga || null;
    this.tro_pa_att_fa_jobb = ratings.tro_pa_att_fa_jobb || null;
    this.stod_fran_natverk = ratings.stod_fran_natverk || null;
    this.samarbetsformaga = ratings.samarbetsformaga || null;
    this.jobbsokningsbeteende = ratings.jobbsokningsbeteende || null;
    this.kunskap_om_arbetsmarknaden = ratings.kunskap_om_arbetsmarknaden || null;
    this.malmedvetenhet = ratings.malmedvetenhet || null;
  }

  // 🟢 Spara rating
  static async save(participantId, ratings) {
    const query = `
      INSERT INTO ratings (
        participant_id,
        hantering_av_vardagen,
        halsa,
        koncentrationsformaga,
        tro_pa_att_fa_jobb,
        stod_fran_natverk,
        samarbetsformaga,
        jobbsokningsbeteende,
        kunskap_om_arbetsmarknaden,
        malmedvetenhet,
        created_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
      RETURNING *;
    `;

    const values = [
      participantId,
      ratings.hantering_av_vardagen || null,
      ratings.halsa || null,
      ratings.koncentrationsformaga || null,
      ratings.tro_pa_att_fa_jobb || null,
      ratings.stod_fran_natverk || null,
      ratings.samarbetsformaga || null,
      ratings.jobbsokningsbeteende || null,
      ratings.kunskap_om_arbetsmarknaden || null,
      ratings.malmedvetenhet || null,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Fel vid sparande av rating:', error);
      throw error;
    }
  }

  // 🟢 Hämta senaste rating
  static async getByUserId(participantId) {
    const query = `
      SELECT * FROM ratings
      WHERE participant_id = $1
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    try {
      const result = await pool.query(query, [participantId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Fel vid hämtning av senaste rating:', error);
      throw error;
    }
  }

  // 🟢 Hämta första rating
  static async getFirstByUserId(participantId) {
    const query = `
      SELECT * FROM ratings
      WHERE participant_id = $1
      ORDER BY created_at ASC
      LIMIT 1;
    `;
    try {
      const result = await pool.query(query, [participantId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Fel vid hämtning av första rating:', error);
      throw error;
    }
  }

  // 🟢 Hämta alla ratings
  static async getAllByUserId(participantId) {
    const query = `
      SELECT * FROM ratings
      WHERE participant_id = $1
      ORDER BY created_at ASC;
    `;
    try {
      const result = await pool.query(query, [participantId]);
      return result.rows || [];
    } catch (error) {
      console.error('❌ Fel vid hämtning av alla ratings:', error);
      throw error;
    }
  }
}

module.exports = Rating;
