const { getLatestSensitiveData, saveSensitiveData } = require('../models/sensitiveData');

// 🔒 Controller för att spara känslig data för en deltagare
const saveData = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  const { participantId } = req.params;
  const sensitiveData = req.body;

  try {
    const result = await saveSensitiveData(participantId, sensitiveData);
    res.status(201).json({ message: 'Kartläggning sparad!', data: result });
  } catch (error) {
    console.error('❌ Fel vid sparande av känslig data:', error);
    res.status(500).json({ message: 'Något gick fel vid sparande av kartläggningen.' });
  }
};

// 🔒 Controller för att hämta den senaste kartläggningen för en deltagare
const getData = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  const { participantId } = req.params;

  try {
    const data = await getLatestSensitiveData(participantId);

    if (!data) {
      return res.status(404).json({ message: 'Ingen kartläggning hittades för denna deltagare.' });
    }

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
  } catch (error) {
    console.error('❌ Fel vid hämtning av känslig data:', error);
    res.status(500).json({ message: 'Något gick fel vid hämtning av kartläggningen.' });
  }
};

module.exports = { saveData, getData };
