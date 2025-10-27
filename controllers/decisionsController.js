const decisionsModel = require('../models/decisionsModel');

// 🔒 Skapa beslut
const createDecision = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  const { 
    bestallare,
    insats,
    beslut,
    startDate,
    endDate,
    executor,
    workplace,
    ansvarig,
    handledare,
    telefon,
    kategori
  } = req.body;

  const participantId = req.params.participantId;
  const insatsId = req.params.insatsId;

  console.log('Received decision data:', req.body);

  // Validering av obligatoriska fält
  if (!bestallare || !beslut || !startDate || !endDate || !executor) {
    return res.status(400).json({ message: 'Alla obligatoriska fält måste vara ifyllda.' });
  }

  try {
    const newDecision = await decisionsModel.updateDecision({
      participantId,
      insatsId,
      bestallare,
      insats: insats || null,
      beslut,
      startDate,
      endDate,
      executor,
      workplace: workplace || null,
      ansvarig: ansvarig || null,
      handledare: handledare || null,
      telefon: telefon || null,
      kategori: kategori || null,
      createdBy: req.user.username // logga vem som skapade beslutet
    });

    res.status(201).json({
      message: 'Beslutet har sparats!',
      data: newDecision,
    });
  } catch (error) {
    console.error('Error creating decision:', error);
    res.status(500).json({ message: 'Något gick fel. Försök igen senare.' });
  }
};

// 🔒 Hämta alla beslut för en specifik deltagare och insats
const getDecisionsByParticipantAndInsats = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  const participantId = req.params.participantId;
  const insatsId = req.params.insatsId;

  try {
    const decisions = await decisionsModel.getDecisionsByParticipantAndInsats(participantId, insatsId);
    res.status(200).json(decisions);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ message: 'Något gick fel. Försök igen senare.' });
  }
};

// 🔒 Hämta alla beslut
const getAllDecisions = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  try {
    const decisions = await decisionsModel.getAllDecisions();
    res.status(200).json(decisions);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ message: 'Något gick fel. Försök igen senare.' });
  }
};

// 🔒 Avsluta en insats
const endInsats = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  const { participantId, endingStatus } = req.body;
  const { insatsId } = req.params;

  if (!endingStatus || !participantId) {
    return res.status(400).json({ message: 'Både deltagar-ID och avslutningsstatus måste anges.' });
  }

  try {
    const updatedInsats = await decisionsModel.endInsats(insatsId, participantId, endingStatus, req.user.username);
    res.status(200).json({
      message: 'Insatsen har avslutats!',
      data: updatedInsats,
    });
  } catch (error) {
    console.error('Error ending insats:', error);
    res.status(500).json({ message: 'Något gick fel. Försök igen senare.' });
  }
};

module.exports = {
  createDecision,
  getDecisionsByParticipantAndInsats,
  getAllDecisions,
  endInsats,
};
