const jwt = require('jsonwebtoken');
const { getLatestSensitiveData, saveSensitiveData } = require('../models/sensitiveData');

// 🔒 POST - Spara känslig data för en deltagare
const saveData = async (req, res) => {
  try {
    // ✅ Läs token från Authorization-header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Ingen eller ogiltig Authorization-header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    const { participantId } = req.params;
    const sensitiveData = req.body;

    if (!participantId) {
      return res.status(400).json({ message: 'Deltagar-ID saknas i förfrågan.' });
    }

    const result = await saveSensitiveData(participantId, sensitiveData);
    console.log(`👤 ${decoded.username} sparade kartläggning för deltagare ${participantId}`);

    res.status(201).json({
      message: 'Kartläggning sparad!',
      data: result,
    });
  } catch (error) {
    console.error('❌ Fel vid sparande av känslig data:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Ogiltig eller utgången token' });
    }

    res.status(500).json({
      message: 'Något gick fel vid sparande av kartläggningen.',
      error: error.message,
    });
  }
};

// 🔒 GET - Hämta den senaste kartläggningen för en deltagare
const getData = async (req, res) => {
  try {
    // ✅ Läs token från Authorization-header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Ingen eller ogiltig Authorization-header' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ message: 'Deltagar-ID saknas i förfrågan.' });
    }

    const data = await getLatestSensitiveData(participantId);

    if (!data) {
      return res.status(200).json({
        message: 'Ingen kartläggning hittades för denna deltagare.',
        data: {},
      });
    }

    res.status(200).json({
      message: 'Kartläggning hämtades framgångsrikt!',
      data: {
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
      },
    });
  } catch (error) {
    console.error('❌ Fel vid hämtning av känslig data:', error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Ogiltig eller utgången token' });
    }

    res.status(500).json({
      message: 'Något gick fel vid hämtning av kartläggningen.',
      error: error.message,
    });
  }
};

module.exports = { saveData, getData };
