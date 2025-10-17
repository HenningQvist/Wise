// models/completedStepModel.js
const { Pool } = require('pg');
const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port:     process.env.DB_PORT,
});

const saveCompletedSteps = async (participantId, completedSteps) => {
  // Om någon råkat skicka in hela req.body.completedSteps
  // med nyckeln grundforutsattningar, så plocka ut den
  const steps = completedSteps.grundforutsattningar || completedSteps;

  console.log('📦 Extraherade steps:', steps);
  const values = [
    participantId,
    steps['Fysisk hälsa'],
    steps['Psykisk hälsa'],
    steps['Missbruk'],
    steps['Bostadssituation'],
    steps['Social isolering']
  ];
  console.log('📨 Skickar till DB:', values);

  try {
    const result = await pool.query(`
      INSERT INTO grundforutsattningar (
        participant_id,
        fysisk_halsa,
        psykisk_halsa,
        missbruk,
        bostadssituation,
        social_isolering
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `, values);

    console.log('✅ Sparat i DB:', result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('🔥 Fel vid DB-insert:', err);
    throw err;
  }
};

const findByParticipantId = async (participantId) => {
  const result = await pool.query(
    'SELECT * FROM grundforutsattningar WHERE participant_id = $1',
    [participantId]
  );
  return result.rows[0];
};

const updateCompletedSteps = async (participantId, completedSteps) => {
  // Samma logik för att plocka ut stegen
  const steps = completedSteps.grundforutsattningar || completedSteps;

  try {
    const query = `
      UPDATE grundforutsattningar
      SET fysisk_halsa      = $1,
          psykisk_halsa     = $2,
          missbruk          = $3,
          bostadssituation  = $4,
          social_isolering  = $5
      WHERE participant_id  = $6
    `;
    const values = [
      steps['Fysisk hälsa'],
      steps['Psykisk hälsa'],
      steps['Missbruk'],
      steps['Bostadssituation'],
      steps['Social isolering'],
      participantId
    ];
    console.log('🛠 Uppdaterings-värden:', values);
    await pool.query(query, values);
  } catch (error) {
    console.error('Fel vid uppdatering av grundförutsättningar:', error);
    throw error;
  }
};

module.exports = {
  saveCompletedSteps,
  findByParticipantId,
  updateCompletedSteps
};
