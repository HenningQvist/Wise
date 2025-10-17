const FollowUp = require('../models/followUpModel');

// Skapa en ny uppföljning
const createFollowUp = async (req, res) => {
  const {
    fromName,
    fromEmail,
    toEmail,
    subject,
    message,
    date,
    startTime,
    endTime,
    location,
    created_by,
    participant_id // ✅ Lägg till här
  } = req.body;

  try {
    const newFollowUp = await FollowUp.createFollowUp({
      fromName,
      fromEmail,
      toEmail,
      subject,
      message,
      date,
      startTime,
      endTime,
      location,
      created_by,
      participant_id // ✅ Skicka med
    });

    res.status(201).json({ message: 'Uppföljning skapad', followUp: newFollowUp });
  } catch (err) {
    console.error('❌ Fel vid skapande av uppföljning:', err);
    res.status(500).json({ error: 'Det gick inte att skapa uppföljningen.' });
  }
};

// Hämta alla uppföljningar
const getAllFollowUps = async (req, res) => {
  try {
    const followUps = await FollowUp.getAllFollowUps();
    res.json(followUps);
  } catch (err) {
    console.error('❌ Fel vid hämtning av uppföljningar:', err);
    res.status(500).json({ error: 'Kunde inte hämta uppföljningar.' });
  }
};

// Hämta uppföljningar för specifik e-post
const getFollowUpsByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const followUps = await FollowUp.getFollowUpsByEmail(email);
    res.json(followUps);
  } catch (err) {
    console.error('❌ Fel vid hämtning av uppföljningar via e-post:', err);
    res.status(500).json({ error: 'Kunde inte hämta uppföljningar för den angivna e-posten.' });
  }
};

// Hämta uppföljningar för specifik deltagare via participant_id
const getFollowUpsByParticipantId = async (req, res) => {
  const { participantId } = req.params;
  try {
    const followUps = await FollowUp.getFollowUpsByParticipantId(participantId);
    res.json(followUps);
  } catch (err) {
    console.error('❌ Fel vid hämtning av uppföljningar via participant_id:', err);
    res.status(500).json({ error: 'Kunde inte hämta uppföljningar för den angivna deltagaren.' });
  }
};

// ✅ Endast en korrekt export
module.exports = {
  createFollowUp,
  getAllFollowUps,
  getFollowUpsByEmail,
  getFollowUpsByParticipantId
};
