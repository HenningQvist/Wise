const { Pool } = require('pg');
require('dotenv').config(); 

// Kontrollera att alla miljövariabler finns
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Saknad miljövariabel: ${varName}`);
    process.exit(1);
  }
}

// PostgreSQL anslutning
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

console.log('🔹 PostgreSQL anslutning skapad.');

// Hämta mål för en deltagare
const getGoalByParticipantId = async (participantId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM goals WHERE participant_id = $1',
      [participantId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('❌ Fel vid hämtning av mål:', error.message);
    throw new Error('Kunde inte hämta målet');
  }
};

const saveGoalForParticipant = async (participantId, goalData) => {
  const { goal, progress, reflection1, reflection2, completionDate, createdBy } = goalData;

  if (!goal || !progress || !completionDate) {
    return { message: 'Mål, progress och datum för målets uppfyllelse är obligatoriska' };
  }

  try {
    const existingGoal = await getGoalByParticipantId(participantId);

    if (existingGoal) {
      // Kontrollera om måltexten har ändrats
      const shouldResetCompletion =
        existingGoal.goal.trim() !== goal.trim();

      const updateQuery = `
        UPDATE goals
        SET goal = $1,
            progress = $2,
            reflection1 = $3,
            reflection2 = $4,
            completion_date = $5,
            created_by = $6
            ${shouldResetCompletion ? ', is_completed = false, completed_at = NULL' : ''}
        WHERE participant_id = $7
        RETURNING *;
      `;

      const result = await pool.query(updateQuery, [
        goal, progress, reflection1, reflection2, completionDate, createdBy, participantId
      ]);
      return result.rows[0];  // Returnera den uppdaterade raden
    } else {
      // Skapa ett nytt mål
      const insertQuery = `
        INSERT INTO goals (goal, progress, reflection1, reflection2, completion_date, participant_id, created_by, is_completed, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, false, NULL)
        RETURNING *;
      `;
      const result = await pool.query(insertQuery, [
        goal, progress, reflection1, reflection2, completionDate, participantId, createdBy
      ]);
      return result.rows[0];  // Returnera den insatta raden
    }
  } catch (error) {
    console.error('❌ Fel vid sparande/uppradering av mål:', error.message);
    throw new Error('Kunde inte spara målet');
  }
};


// Klarmarkera ett mål
const markGoalAsCompleted = async (participantId, goalId, { is_completed, completedAt }) => {
  try {
    const updateQuery = `
      UPDATE goals
      SET is_completed = $1, completed_at = $2
      WHERE participant_id = $3 AND id = $4
      RETURNING *;
    `;
    const result = await pool.query(updateQuery, [is_completed, completedAt, participantId, goalId]);

    return result.rows[0];
  } catch (error) {
    console.error('❌ Fel vid uppdatering av målstatus:', error.message);
    throw new Error('Kunde inte uppdatera målstatus');
  }
};

// Hämta uppgifter för en deltagare
const getTasksByParticipantId = async (participantId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE participant_id = $1',
      [participantId]
    );
    return result.rows;
  } catch (error) {
    console.error('❌ Fel vid hämtning av uppgifter:', error.message);
    throw new Error('Kunde inte hämta uppgifter');
  }
};

// Hämta alla uppgifter
const getAllTasks = async () => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    return result.rows;
  } catch (error) {
    console.error('❌ Fel vid hämtning av uppgifter:', error.message);
    throw new Error('Kunde inte hämta uppgifter');
  }
};

// Lägg till en ny uppgift (med createdBy)
const addTask = async ({ specific, measurable, achievable, relevant, timeBound, responsible, progress, participantId, createdBy }) => {
  console.log('In addTask, received values:', { specific, measurable, achievable, relevant, timeBound, responsible, progress, participantId, createdBy });

  const query = `
    INSERT INTO tasks (specific, measurable, achievable, relevant, time_bound, responsible, progress, participant_id, created_by, is_completed)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
    RETURNING *;
  `;
  const values = [specific, measurable, achievable, relevant, timeBound, responsible, progress, participantId, createdBy];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0]; 
  } catch (error) {
    console.error('❌ Fel vid att lägga till uppgift:', error.message);
    throw new Error('Kunde inte lägga till uppgiften');
  }
};

// Klarmarkera en uppgift och sätt completed_at till nuvarande tid
const completeTask = async (taskId) => {
  const query = `
    UPDATE tasks
    SET is_completed = TRUE,
        completed_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [taskId]);

    if (result.rowCount === 0) {
      throw new Error('Uppgift hittades inte');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Fel vid klarmarkering av uppgift:', error.message);
    throw new Error('Kunde inte klarmarkera uppgiften');
  }
};


// Hämta alla mål från databasen (korrekt användning av pool.query)
const getAllGoals = async () => {
  try {
    console.log('Försöker hämta alla mål...');
    const result = await pool.query('SELECT * FROM goals'); // Använd pool.query här
    console.log('Mål hämtade:', result.rows);
    return result.rows;
  } catch (error) {
    console.error('Fel vid hämtning av mål:', error);
    throw new Error('Kunde inte hämta mål från databasen');
  }
};

// Uppdatera endast progress för ett mål
const updateGoalProgress = async (participantId, progress) => {
  try {
    const result = await pool.query(
      `
      UPDATE goals
      SET progress = $1,
          updated_at = NOW()
      WHERE participant_id = $2
      RETURNING *;
      `,
      [progress, participantId]
    );

    if (result.rowCount === 0) {
      throw new Error('Målet kunde inte uppdateras');
    }

    return result.rows[0];
  } catch (error) {
    console.error('❌ Fel vid uppdatering av progress:', error.message);
    throw new Error('Kunde inte uppdatera progress');
  }
};

// Exportera alla funktioner
module.exports = { 
  getGoalByParticipantId, 
  saveGoalForParticipant, 
  getTasksByParticipantId, 
  getAllTasks,
  addTask, 
  completeTask,
  getAllGoals,
  markGoalAsCompleted,
  updateGoalProgress
};
