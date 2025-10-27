const { getAllNotesByParticipant, getLatestNoteByParticipant, saveNote } = require('../models/notesModel');

// 🔒 Hämta alla anteckningar för en specifik deltagare
const getNotes = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  const { participantId } = req.params; // Förutsätter att deltagar-ID skickas som param

  try {
    const notes = await getAllNotesByParticipant(participantId);
    res.status(200).json(notes);
  } catch (error) {
    console.error('Fel vid hämtning av anteckningar:', error);
    res.status(500).json({ message: 'Kunde inte hämta anteckningar', error: error.message });
  }
};

// 🔒 Hämta den senaste anteckningen för en specifik deltagare
const getLatest = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  const { participantId } = req.params;

  try {
    const latestNote = await getLatestNoteByParticipant(participantId);
    if (!latestNote) {
      return res.status(404).json({ message: 'Ingen anteckning hittades' });
    }
    res.status(200).json(latestNote);
  } catch (error) {
    console.error('Fel vid hämtning av senaste anteckning:', error);
    res.status(500).json({ message: 'Kunde inte hämta den senaste anteckningen', error: error.message });
  }
};

// 🔒 Spara en ny anteckning för en specifik deltagare
const addNote = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  const { participantId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Innehåll är obligatoriskt.' });
  }

  try {
    // Använd req.user.username som författare istället för att ta det från request body
    const author = req.user.username;
    const savedNote = await saveNote(participantId, author, content);
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Fel vid sparande av anteckning:', error);
    res.status(500).json({ message: 'Kunde inte spara anteckning', error: error.message });
  }
};

module.exports = { getNotes, getLatest, addNote };
