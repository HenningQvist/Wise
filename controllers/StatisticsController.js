const StatisticsModel = require('../models/statisticsModel.js');  // Importera modellen med alla databasfunktioner

// 🔒 Hämta kombinerad statistik
const getCombinedStatistics = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  try {
    const filters = req.body.filters || {};

    // Hämta från båda tabellerna via modellen
    const users = await StatisticsModel.getUsers(filters);
    const steps = await StatisticsModel.getSteps(filters);

    // Kombinera användare och deras steg
    const combinedData = users.map(user => {
      const userSteps = steps.filter(step => step.participant_id === user.id);
      return { ...user, step: userSteps };
    });

    res.status(200).json({ data: combinedData });
  } catch (error) {
    console.error('❌ Fel i statistik-controller:', error);
    res.status(500).json({ error: 'Serverfel vid hämtning av statistik.' });
  }
};

// 🔒 Hämta alla deltagare med eventuella filter
const getAllParticipants = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  try {
    const { startDate, endDate, status } = req.body; // Hämta filterdata från body
    const participants = await StatisticsModel.getAllParticipants({ startDate, endDate, status });

    if (!participants || participants.length === 0) {
      return res.status(404).json({ message: 'Inga deltagare hittades med angivna filter.' });
    }

    res.status(200).json({ participants });
  } catch (error) {
    console.error('❌ Fel vid hämtning av deltagare:', error);
    res.status(500).json({ message: 'Serverfel vid hämtning av deltagare' });
  }
};

module.exports = { getCombinedStatistics, getAllParticipants };
