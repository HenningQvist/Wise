const { getAllNotesByParticipant, getLatestNoteByParticipant, saveNote } = require('../models/notesModel');

// Hämta alla anteckningar för en specifik deltagare
const getNotes = async (req, res) => {
  const { participantId } = req.params; // Förutsätter att deltagar-ID skickas som en parameter

  try {
    const notes = await getAllNotesByParticipant(participantId);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Kunde inte hämta anteckningar', error: error.message });
  }
};

// Hämta den senaste anteckningen för en specifik deltagare
const getLatest = async (req, res) => {
  const { participantId } = req.params; // Förutsätter att deltagar-ID skickas som en parameter

  try {
    const latestNote = await getLatestNoteByParticipant(participantId);
    if (!latestNote) {
      return res.status(404).json({ message: 'Ingen anteckning hittades' });
    }
    res.status(200).json(latestNote);
  } catch (error) {
    res.status(500).json({ message: 'Kunde inte hämta den senaste anteckningen', error: error.message });
  }
};

// Spara en ny anteckning för en specifik deltagare
const addNote = async (req, res) => {
  const { participantId } = req.params; // Förutsätter att deltagar-ID skickas som en parameter
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(400).json({ message: 'Författare och innehåll är obligatoriska.' });
  }

  try {
    const savedNote = await saveNote(participantId, author, content);
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Kunde inte spara anteckning', error: error.message });
  }
};

module.exports = { getNotes, getLatest, addNote };
