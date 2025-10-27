const bcrypt = require('bcrypt');
const adminModel = require('../models/adminModel'); // Importera modellen för användare

// 🔹 Hämta alla användare (kräver admin)
const getUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.admin) {
      return res.status(403).json({ message: 'Åtkomst förbjuden: Ingen administratörsbehörighet' });
    }

    const users = await adminModel.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error('Fel vid hämtning av användare:', err);
    res.status(500).json({ message: 'Fel vid hämtning av användare', error: err.message });
  }
};

// 🔹 Hämta användare baserat på ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await adminModel.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'Användare hittades inte' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error('Fel vid hämtning av användare:', err);
    res.status(500).json({ message: 'Serverfel vid hämtning av användare', error: err.message });
  }
};

// 🔹 Uppdatera användare
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, admin, role } = req.body;

  try {
    const user = await adminModel.getUserById(id);
    if (!user) return res.status(404).json({ error: 'Användare inte hittad' });

    // Om användaren inte är admin och försöker ändra admin-status → blockera
    if (!req.user.admin && typeof admin !== 'undefined') {
      return res.status(403).json({ message: 'Endast administratörer kan ändra admin-statusen.' });
    }

    const updatedUser = await adminModel.updateUser(
      id,
      username,
      email,
      admin !== undefined ? admin : user.admin,
      role
    );

    res.json(updatedUser);
  } catch (err) {
    console.error('Fel vid uppdatering av användare:', err);
    res.status(500).json({ error: 'Serverfel vid uppdatering av användare', details: err.message });
  }
};

// 🔹 Ta bort användare
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await adminModel.deleteUser(id);
    res.json({ message: 'Användare borttagen', user: deletedUser });
  } catch (err) {
    console.error('Fel vid borttagning av användare:', err);
    res.status(500).json({ error: 'Serverfel vid borttagning av användare', details: err.message });
  }
};

// 🔹 Skapa handläggare
const createHandler = async (req, res) => {
  try {
    const { email, username, password, admin } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await adminModel.createUser(
      email,
      username,
      hashedPassword,
      admin || false
    );

    res.status(201).json({ message: 'Handläggare skapad', user: newUser });
  } catch (err) {
    console.error('Fel vid skapande av handläggare:', err);
    res.status(500).json({ message: 'Fel vid skapande av handläggare', error: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createHandler,
};
