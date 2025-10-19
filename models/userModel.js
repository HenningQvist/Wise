const pool = require('../config/database'); // Se till att poolen är korrekt konfigurerad

// Hämta användare baserat på e-postadress
const getUserByEmail = async (email) => {
  console.log('🔹 getUserByEmail:', email);
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('🔹 Resultat getUserByEmail:', result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Fel vid hämtning av användare med e-post:', err);
    throw new Error('Fel vid hämtning av användare med e-post');
  }
};

// Hämta användare baserat på användarnamn
const getUserByUsername = async (username) => {
  console.log('🔹 getUserByUsername:', username);
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('🔹 Resultat getUserByUsername:', result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Fel vid hämtning av användare med användarnamn:', err);
    throw new Error('Fel vid hämtning av användare med användarnamn');
  }
};

// Skapa en ny användare
async function createUser({ email, username, password, role, personalNumber = null }) {
  console.log('🔹 createUser payload:', { email, username, role, personalNumber });
  const client = await pool.connect();
  try {
    const query = personalNumber
      ? `INSERT INTO users (email, username, password, role, personalnumber)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`
      : `INSERT INTO users (email, username, password, role)
         VALUES ($1, $2, $3, $4) RETURNING *`;

    const values = personalNumber
      ? [email, username, password, role, personalNumber]
      : [email, username, password, role];

    const result = await client.query(query, values);
    console.log('✅ Ny användare skapad i DB:', result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Fel vid skapande av användare:', err);
    throw new Error('Fel vid skapande av användare');
  } finally {
    client.release();
  }
}

// Uppdatera användarens data
const updateUser = async (id, updatedData) => {
  console.log('🔹 updateUser:', id, updatedData);
  try {
    const query = 'UPDATE users SET email = $1, username = $2, password = $3, role = $4 WHERE id = $5 RETURNING id, email, username, role';
    const values = [updatedData.email, updatedData.username, updatedData.password, updatedData.role, id];
    const result = await pool.query(query, values);
    console.log('✅ Uppdaterad användare:', result.rows[0]);
    return result.rows[0];
  } catch (err) {
    console.error('❌ Fel vid uppdatering av användare:', err);
    throw new Error('Fel vid uppdatering av användare');
  }
};

// Ta bort en användare
const deleteUser = async (id) => {
  console.log('🔹 deleteUser:', id);
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    console.log('✅ Användare borttagen:', result.rows[0]);
    return result.rows.length ? result.rows[0] : null;
  } catch (err) {
    console.error('❌ Fel vid borttagning av användare:', err);
    throw new Error('Fel vid borttagning av användare');
  }
};

// Hämta användare baserat på ID
const getUserById = async (id) => {
  console.log('🔹 getUserById:', id);
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    console.log('🔹 Resultat getUserById:', result.rows[0]);
    return result.rows.length ? result.rows[0] : null;
  } catch (err) {
    console.error('❌ Fel vid hämtning av användare med ID:', err);
    throw err;
  }
};

module.exports = { getUserByEmail, getUserByUsername, createUser, updateUser, deleteUser, getUserById };
