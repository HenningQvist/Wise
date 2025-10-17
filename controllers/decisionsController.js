const decisionsModel = require('../models/decisionsModel');

// Skapa beslut
const createDecision = async (req, res) => {
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
    kategori // <- Hämta kategori från req.body
  } = req.body;

  const participantId = req.params.participantId;
  const insatsId = req.params.insatsId;

  // Logga alla inkommande fält
  console.log('Received decision data:');
  console.log('bestallare:', bestallare);
  console.log('insats:', insats);
  console.log('beslut:', beslut);
  console.log('startDate:', startDate);
  console.log('endDate:', endDate);
  console.log('executor:', executor);
  console.log('workplace:', workplace);
  console.log('ansvarig:', ansvarig);
  console.log('handledare:', handledare);
  console.log('telefon:', telefon);
  console.log('kategori:', kategori); // <- Logga kategori

  // Validera om alla obligatoriska fält är ifyllda
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
      kategori: kategori || null, // <- Lägg till kategori här
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


// Hämta alla beslut för en specifik deltagare och insats
const getDecisionsByParticipantAndInsats = async (req, res) => {
  const participantId = req.params.participantId;
  const insatsId = req.params.insatsId;  // Ta emot insatsId från parametern

  try {
    // Hämta beslut för specifik deltagare och insats
    const decisions = await decisionsModel.getDecisionsByParticipantAndInsats(participantId, insatsId);
    res.status(200).json(decisions);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ message: 'Något gick fel. Försök igen senare.' });
  }
};

// Hämta alla beslut
const getAllDecisions = async (req, res) => {
  try {
    const decisions = await decisionsModel.getAllDecisions();
    res.status(200).json(decisions);
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({ message: 'Något gick fel. Försök igen senare.' });
  }
};

const endInsats = async (req, res) => {
  // Logga inkommande data för att säkerställa att den skickas korrekt
  console.log('Received data in req.body:', req.body);  // Lägg till mer loggning för att visa hela body

  const { participantId, endingStatus } = req.body;
  const { insatsId } = req.params;

  // Validering av inkommande data
  if (!endingStatus || !participantId) {
    console.log('Fel: Både deltagar-ID och avslutningsstatus måste anges.');
    return res.status(400).json({ message: 'Både deltagar-ID och avslutningsstatus måste anges.' });
  }

  try {
    // Anropa modellen för att avsluta insatsen
    console.log('Försöker uppdatera insatsen i modellen...');
    const updatedInsats = await decisionsModel.endInsats(insatsId, participantId, endingStatus);

    // Skicka tillbaka det uppdaterade resultatet som svar
    console.log('Insatsen avslutad:', updatedInsats);
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
  endInsats,  // Exportera den nya funktionen
};
