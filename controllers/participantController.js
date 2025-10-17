const jwt = require('jsonwebtoken');
const { registerParticipant, getParticipants, avslutaParticipant } = require('../models/participantModel');

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

    const token = req.cookies.token;
    if (!token) {
      console.error('❌ Ingen token hittades i cookies.');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔹 JWT dekrypterad:', decoded);

    if (!decoded?.username) {
      console.error('❌ Saknar användarnamn från token.');
      return res.status(401).json({ message: 'Invalid token data' });
    }

    const participantData = {
      firstName, lastName, gender, educationLevel, license,
      personalNumber, address, postalCode, city,
      phoneNumber, unemploymentTime, initiatedBy,
      createdBy: decoded.username,
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




// Funktion för att hämta deltagarlistan
const getCaseList = async (req, res) => {
  try {
    console.log('🔹 Hämtar deltagarlistan...');

    // Hämta token från cookies (inte headers)
    const token = req.cookies['token'];  // Hämta token från cookien

    if (!token) {
      console.error('❌ Ingen token hittades i cookies.');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔹 Token mottagen:', token);

    // Verifiera JWT och få den dekodade användardatan (handläggaren)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 JWT dekrypterad:', decoded);

    // Hämta deltagare baserat på handläggarens användarnamn (createdBy)
    const participants = await getParticipants(decoded.username);  // Se till att "createdBy" används för att filtrera deltagare
    console.log('✅ Deltagarlista hämtad:', participants);

    if (participants.length === 0) {
      return res.status(200).json({ message: 'Inga deltagare har registrerats än.', caseList: [] });
    }

    // Skicka tillbaka deltagarna som JSON
    res.json({ caseList: participants });
  } catch (err) {
    console.error('❌ Fel vid hämtning av deltagarlista:', err.message || err);
    res.status(500).json({ message: 'Error fetching case list', error: err.message || err });
  }
};
// Funktion för att hämta en specifik deltagares uppgifter
const getParticipantById = async (req, res) => {
  try {
    const participantId = req.params.id;  // Hämta id från URL-parametern
    console.log(`🔹 Hämtar deltagare med ID: ${participantId}`);

    // Hämta token från cookies (inte headers)
    const token = req.cookies['token'];  // Hämta token från cookien

    if (!token) {
      console.error('❌ Ingen token hittades i cookies.');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔹 Token mottagen:', token);

    // Verifiera JWT och få den dekodade användardatan (handläggaren)
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 JWT dekrypterad:', decoded);

    // Hämta deltagare baserat på handläggarens användarnamn (createdBy)
    const participants = await getParticipants(decoded.username);  // Se till att "createdBy" används för att filtrera deltagare
    console.log('✅ Deltagarlista hämtad:', participants);

    // Hitta den specifika deltagaren baserat på ID
    const selectedParticipant = participants.find(p => p.id === parseInt(participantId));

    if (!selectedParticipant) {
      console.error(`❌ Deltagare med ID ${participantId} hittades inte.`);
      return res.status(404).json({ message: 'Deltagare inte hittad' });
    }

    // Skicka tillbaka den specifika deltagaren som JSON
    res.json(selectedParticipant);
  } catch (err) {
    console.error('❌ Fel vid hämtning av deltagare:', err.message || err);
    res.status(500).json({ message: 'Error fetching participant data', error: err.message || err });
  }
};

const updateParticipant = async (req, res) => {
  try {
    const participantId = req.params.id;
    const { name, gender, experience, education, license, otherSkills, personalNumber, address, postalCode, city, phoneNumber } = req.body;

    if (!name || !gender || !experience || !education || !phoneNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Hämta token från cookies
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifiera JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    // Uppdatera deltagaren i databasen
    const updatedParticipant = await updateParticipantInDB(participantId, { name, gender, experience, education, license, otherSkills, personalNumber, address, postalCode, city, phoneNumber });
    
    if (!updatedParticipant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    res.status(200).json({ message: 'Participant updated successfully', updatedParticipant });
  } catch (err) {
    console.error('Error updating participant:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const avslutaDeltagare = async (req, res) => {
  try {
    const { participantId, reason } = req.body;

    if (!participantId || !reason) {
      return res.status(400).json({ message: 'Participant ID och avslutsorsak krävs.' });
    }

    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Ingen token hittades.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    const result = await avslutaParticipant(participantId, reason, decoded.username);

    if (!result) {
      return res.status(404).json({ message: 'Deltagare inte hittad eller kunde inte avslutas.' });
    }

    res.status(200).json({ message: 'Deltagare avslutad.' });
  } catch (err) {
    console.error('❌ Fel vid avslutning:', err.message || err);
    res.status(500).json({ message: 'Internt serverfel vid avslutning.' });
  }
};

module.exports = { 
  register, 
  getCaseList, 
  getParticipantById,  
  updateParticipant, 
  avslutaDeltagare
};
