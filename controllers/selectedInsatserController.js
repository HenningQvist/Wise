const { saveSelectedInsatser, getSelectedInsatser, getAllSelectedInsatser } = require('../models/selectedInsatserModel');

// POST - Spara valda insatser för en deltagare
const createSelectedInsatserController = async (req, res) => {
  const { participantId, step, selectedInsatser } = req.body;

  if (!participantId || !Array.isArray(selectedInsatser) || selectedInsatser.length === 0) {
    return res.status(400).json({ error: 'Ogiltig förfrågan. Kontrollera participantId och insatsdata.' });
  }

  try {
    const savedInsatser = await saveSelectedInsatser(participantId, step, selectedInsatser);
    res.status(201).json({
      message: 'Valda insatser sparades framgångsrikt!',
      savedInsatser,
    });
  } catch (error) {
    console.error('❌ Fel vid sparande av valda insatser:', error);
    res.status(500).json({ error: 'Fel vid sparande av valda insatser' });
  }
};

// GET - Hämta valda insatser för en deltagare
const getSelectedInsatserController = async (req, res) => {
  const participantId = req.params.participantId || req.body.participantId;

  if (!participantId) {
    return res.status(400).json({ error: 'Deltagar-ID saknas i förfrågan.' });
  }

  try {
    const selectedInsatser = await getSelectedInsatser(participantId);

    if (selectedInsatser.length === 0) {
      return res.status(404).json({ message: 'Inga insatser hittades för denna deltagare.' });
    }

    res.status(200).json({
      message: 'Valda insatser hämtades framgångsrikt!',
      selectedInsatser,
    });
  } catch (error) {
    console.error('❌ Fel vid hämtning av valda insatser:', error);
    res.status(500).json({ error: 'Fel vid hämtning av valda insatser' });
  }
};

// GET - Hämta alla valda insatser (utan krav på participantId)
const getAllSelectedInsatserController = async (req, res) => {
  try {
    const allSelectedInsatser = await getAllSelectedInsatser(); // Anpassa denna funktion i din service/databasmodell

    if (allSelectedInsatser.length === 0) {
      return res.status(404).json({ message: 'Inga insatser hittades.' });
    }

    res.status(200).json({
      message: 'Alla valda insatser hämtades framgångsrikt!',
      selectedInsatser: allSelectedInsatser,
    });
  } catch (error) {
    console.error('❌ Fel vid hämtning av alla valda insatser:', error);
    res.status(500).json({ error: 'Fel vid hämtning av alla valda insatser' });
  }
};

module.exports = {
  createSelectedInsatserController,
  getSelectedInsatserController,
  getAllSelectedInsatserController,
};
