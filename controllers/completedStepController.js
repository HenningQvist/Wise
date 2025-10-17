// controllers/completedStepController.js
const {
  saveCompletedSteps,
  updateCompletedSteps,
  findByParticipantId
} = require('../models/completedStepModel');

// POST /api/saveSteps/   — befintlig funktion
const saveOrUpdateCompletedSteps = async (req, res) => {
  try {
    console.log('📥 Mottaget req.body:', req.body);
    const { participantId, completedSteps } = req.body;
    const existing = await findByParticipantId(participantId);

    if (existing) {
      console.log('🛠 Uppdaterar med:', completedSteps.grundforutsattningar);
      await updateCompletedSteps(participantId, completedSteps.grundforutsattningar);
      return res.status(200).json({ message: 'Grundförutsättningar uppdaterades' });
    } else {
      console.log('🆕 Sparar ny med:', completedSteps.grundforutsattningar);
      await saveCompletedSteps(participantId, completedSteps.grundforutsattningar);
      return res.status(201).json({ message: 'Grundförutsättningar sparades' });
    }
  } catch (error) {
    console.error('🔥 Fel vid spara/uppdatera:', error);
    res.status(500).json({ error: 'Något gick fel vid spara/uppdatera av grundförutsättningar' });
  }
};

// GET /api/steps/:participantId  — ny funktion
const getCompletedSteps = async (req, res) => {
  try {
    const participantId = req.params.participantId;
    console.log('🔍 Hämtar steg för participant:', participantId);

    const row = await findByParticipantId(participantId);
    if (!row) {
      // Om det inte finns någon rad, returnera default-nivåer 0
      const empty = {
        grundforutsattningar: {
          'Fysisk hälsa': 0,
          'Psykisk hälsa': 0,
          'Missbruk': 0,
          'Bostadssituation': 0,
          'Social isolering': 0
        }
      };
      return res.status(200).json(empty);
    }

    // Mappa kolumnerna tillbaka till dina etiketter
    const mapped = {
      grundforutsattningar: {
        'Fysisk hälsa':        row.fysisk_halsa,
        'Psykisk hälsa':       row.psykisk_halsa,
        'Missbruk':            row.missbruk,
        'Bostadssituation':    row.bostadssituation,
        'Social isolering':    row.social_isolering
      }
    };

    console.log('✅ Returnerar sparade steg:', mapped);
    res.status(200).json(mapped);
  } catch (error) {
    console.error('🔥 Fel vid hämtning av steg:', error);
    res.status(500).json({ error: 'Kunde inte hämta grundförutsättningar' });
  }
};

module.exports = {
  saveOrUpdateCompletedSteps,
  getCompletedSteps
};
