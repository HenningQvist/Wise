const jwt = require('jsonwebtoken');
const SummaryModel = require('../models/summaryModel');

// 🔒 Spara sammanfattning för en deltagare
const saveSummary = async (req, res) => {
  try {
    const token = req.cookies['token'];
    if (!token) return res.status(401).json({ message: 'Ingen token tillhandahållen' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    const { participantId, summary } = req.body;
    if (!participantId || !summary) {
      return res.status(400).json({ error: 'participantId och summary krävs.' });
    }

    const saved = await SummaryModel.saveSummary(participantId, summary);
    console.log(`✅ Sammanfattning sparad för deltagare ${participantId} av användare ${decoded.username}`);
    res.status(201).json({ message: 'Sammanfattning sparad.', data: saved });
  } catch (error) {
    console.error('❌ Fel vid sparande av sammanfattning:', error);
    res.status(500).json({ error: 'Internt serverfel.' });
  }
};

// 🔹 Hämta senaste sammanfattningen för en deltagare
const getSummary = async (req, res) => {
  try {
    const token = req.cookies['token'];
    if (!token) return res.status(401).json({ message: 'Ingen token tillhandahållen' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ error: 'Deltagar-ID saknas.' });
    }

    const summary = await SummaryModel.getLatestSummary(participantId);
    if (!summary) {
      return res.status(404).json({ message: 'Ingen sammanfattning hittades.' });
    }

    res.status(200).json(summary);
  } catch (error) {
    console.error('❌ Fel vid hämtning av sammanfattning:', error);
    res.status(500).json({ error: 'Internt serverfel.' });
  }
};

module.exports = {
  saveSummary,
  getSummary,
};
