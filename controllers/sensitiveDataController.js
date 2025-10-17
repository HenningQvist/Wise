const jwt = require('jsonwebtoken');
const { getLatestSensitiveData, saveSensitiveData } = require('../models/sensitiveData');

// Controller för att spara känslig data för en deltagare
const saveData = async (req, res) => {
  const { participantId } = req.params;
  const sensitiveData = req.body;

  try {
    // Hämta token från cookies
    const token = req.cookies['token'];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifiera JWT och få den dekodade användardatan
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    // Spara den känsliga datan
    const result = await saveSensitiveData(participantId, sensitiveData);
    res.status(201).json({ message: 'Kartläggning sparad!', data: result });
  } catch (error) {
    console.error('Error saving sensitive data:', error);
    res.status(500).json({ message: 'Något gick fel vid sparande av kartläggningen.' });
  }
};

// Controller för att hämta den senaste kartläggningen för en deltagare
const getData = async (req, res) => {
  const { participantId } = req.params;

  try {
    // Hämta token från cookies
    const token = req.cookies['token'];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifiera JWT och få den dekodade användardatan
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    // Hämta den senaste kartläggningen
    const data = await getLatestSensitiveData(participantId);
    if (data) {
      // Om data finns, skicka den som JSON
      res.status(200).json({
        grundläggande_uppgifter: data.grundläggande_uppgifter,
        hantering_av_vardagen: data.hantering_av_vardagen,
        hälsa: data.hälsa,
        koncentrationsförmåga: data.koncentrationsförmåga,
        tro_på_att_få_jobb: data.tro_på_att_få_jobb,
        stöd_från_nätverk: data.stöd_från_nätverk,
        samarbetsförmåga: data.samarbetsförmåga,
        jobbsökningsbeteende: data.jobbsökningsbeteende,
        kunskap_om_arbetsmarknaden: data.kunskap_om_arbetsmarknaden,
        målmedvetenhet: data.målmedvetenhet,
      });
    } else {
      res.status(404).json({ message: 'Ingen kartläggning hittades för denna deltagare.' });
    }
  } catch (error) {
    console.error('Error fetching sensitive data:', error);
    res.status(500).json({ message: 'Något gick fel vid hämtning av kartläggningen.' });
  }
};

module.exports = { saveData, getData };
