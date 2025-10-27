const { registerParticipant, getParticipants, avslutaParticipant, updateParticipantInDB } = require('../models/participantModel');

// 🔒 Alla routes använder authenticateUser-middleware
// req.user innehåller JWT-data: id, username, role etc.

const register = async (req, res) => {
  try {
    console.log('🔹 Inkommande registreringsförfrågan:', req.body);

    const {
      firstName, lastName, gender, educationLevel,
      license, personalNumber, address, postalCode,
      city, phoneNumber, unemploymentTime, initiatedBy
    } = req.body;

    if (!firstName || !lastName || !gender || !educationLevel || !phoneNumber || !personalNumber || !address || !postalCode || !city || !unemploymentTime || !initiatedBy) {
      console.error('❌ Valideringsfel: Obligatoriska fält saknas.');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const participantData = {
      firstName,
      lastName,
      gender,
      educationLevel,
      license,
      personalNumber,
      address,
      postalCode,
      city,
      phoneNumber,
      unemploymentTime,
      initiatedBy,
      createdBy: req.user.username, // ✅ Från authenticateUser
    };

    console.log('🔹 Deltagardata innan databaslagring:', participantData);

    const newParticipant = await registerParticipant(participantData);
    console.log('✅ Deltagare registrerad i databasen:', newParticipant);

    res.status(201).json({
      message: 'Participant registered successfully',
      participantId: newParticipant.id,
    });

  } catch (err) {
    console.error('❌ Fel vid registrering av deltagare:', err.message || err);
    res.status(500).json({ message: 'Internal server error', error: err.message || err });
  }
};

const getCaseList = async (req, res) => {
  try {
    console.log('🔹 Hämtar deltagarlistan...');

    const participants = await getParticipants(req.user.username);
    console.log('✅ Deltagarlista hämtad:', participants);

    if (participants.length === 0) {
      return res.status(200).json({ message: 'Inga deltagare har registrerats än.', caseList: [] });
    }

    res.json({ caseList: participants });

  } catch (err) {
    console.error('❌ Fel vid hämtning av deltagarlista:', err.message || err);
    res.status(500).json({ message: 'Error fetching case list', error: err.message || err });
  }
};

const getParticipantById = async (req, res) => {
  try {
    const participantId = parseInt(req.params.id);
    console.log(`🔹 Hämtar deltagare med ID: ${participantId}`);

    const participants = await getParticipants(req.user.username);
    const selectedParticipant = participants.find(p => p.id === participantId);

    if (!selectedParticipant) {
      console.error(`❌ Deltagare med ID ${participantId} hittades inte.`);
      return res.status(404).json({ message: 'Deltagare inte hittad' });
    }

    res.json(selectedParticipant);

  } catch (err) {
    console.error('❌ Fel vid hämtning av deltagare:', err.message || err);
    res.status(500).json({ message: 'Error fetching participant data', error: err.message || err });
  }
};

const updateParticipant = async (req, res) => {
  try {
    const participantId = parseInt(req.params.id);
    const { name, gender, experience, education, license, otherSkills, personalNumber, address, postalCode, city, phoneNumber } = req.body;

    if (!name || !gender || !experience || !education || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const updatedParticipant = await updateParticipantInDB(participantId, { name, gender, experience, education, license, otherSkills, personalNumber, address, postalCode, city, phoneNumber });

    if (!updatedParticipant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.status(200).json({ message: 'Participant updated successfully', updatedParticipant });

  } catch (err) {
    console.error('❌ Fel vid uppdatering av deltagare:', err.message || err);
    res.status(500).json({ message: 'Internal server error', error: err.message || err });
  }
};

const avslutaDeltagare = async (req, res) => {
  try {
    const { participantId, reason } = req.body;

    if (!participantId || !reason) {
      return res.status(400).json({ message: 'Participant ID och avslutsorsak krävs.' });
    }

    const result = await avslutaParticipant(participantId, reason, req.user.username);

    if (!result) {
      return res.status(404).json({ message: 'Deltagare inte hittad eller kunde inte avslutas.' });
    }

    res.status(200).json({ message: 'Deltagare avslutad.' });

  } catch (err) {
    console.error('❌ Fel vid avslutning:', err.message || err);
    res.status(500).json({ message: 'Internt serverfel vid avslutning.', error: err.message || err });
  }
};

module.exports = {
  register,
  getCaseList,
  getParticipantById,
  updateParticipant,
  avslutaDeltagare
};
