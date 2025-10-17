// controllers/summaryController.js
const SummaryModel = require('../models/summaryModel');

const saveSummary = async (req, res) => {
  const { participantId, summary } = req.body;

  if (!participantId || !summary) {
    return res.status(400).json({ error: 'participantId och summary krävs.' });
  }

  try {
    const saved = await SummaryModel.saveSummary(participantId, summary);
    res.status(201).json({ message: 'Sammanfattning sparad.', data: saved });
  } catch (error) {
    console.error('Fel vid sparande av sammanfattning:', error);
    res.status(500).json({ error: 'Internt serverfel.' });
  }
};

const getSummary = async (req, res) => {
  const participantId = req.params.participantId;

  try {
    const summary = await SummaryModel.getLatestSummary(participantId);
    if (!summary) {
      return res.status(404).json({ message: 'Ingen sammanfattning hittades.' });
    }
    res.json(summary);
  } catch (error) {
    console.error('Fel vid hämtning av sammanfattning:', error);
    res.status(500).json({ error: 'Internt serverfel.' });
  }
};

module.exports = {
  saveSummary,
  getSummary,
};
