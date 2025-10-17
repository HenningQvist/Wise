const StatisticsModel = require('../models/statisticsModel.js');  // Importera modellen med alla databasfunktioner

// Funktion för att hämta kombinerad statistik
const getCombinedStatistics = async (req, res) => {
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
    console.error('Fel i statistik-controller:', error);
    res.status(500).json({ error: 'Serverfel vid hämtning av statistik.' });
  }
};

const getAllParticipants = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.body; // Hämta från body

    const participants = await StatisticsModel.getAllParticipants({ startDate, endDate, status });

    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Något gick fel vid hämtning av deltagare' });
  }
};






module.exports = { getCombinedStatistics, getAllParticipants };
