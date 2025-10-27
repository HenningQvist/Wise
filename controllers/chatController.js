const Chat = require('../models/chatModel');

// 🔒 Middleware för att skydda routes används på routernivå, så req.user är alltid tillgänglig

// Hämtar meddelanden för en specifik deltagare
const getChatMessages = async (req, res) => {
  const participantId = req.params.participantId;
  console.log('Försöker hämta meddelanden för deltagare:', participantId);

  try {
    // Validera att req.user är satt
    if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

    const messages = await Chat.getMessagesByParticipant(participantId);
    console.log('Meddelanden hämtade:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Fel vid hämtning av meddelanden:', error);
    res.status(500).json({ message: 'Kunde inte hämta meddelanden', error: error.message });
  }
};

// Hämtar alla meddelanden för alla deltagare (admin-endpoint)
const getAllChatMessages = async (req, res) => {
  try {
    if (!req.user || !req.user.admin) {
      return res.status(403).json({ message: 'Endast admin kan hämta alla meddelanden' });
    }

    const messages = await Chat.getAllMessages();
    console.log('Alla meddelanden hämtade:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Fel vid hämtning av alla meddelanden:', error);
    res.status(500).json({ message: 'Kunde inte hämta alla meddelanden', error: error.message });
  }
};

// Skickar ett nytt meddelande
const postChatMessage = async (req, res) => {
  const participantId = req.params.participantId;
  const { message } = req.body;

  console.log('Försöker skicka meddelande för deltagare:', participantId);
  console.log('Meddelande som skickas:', message);

  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Meddelandet får inte vara tomt' });
  }

  try {
    // Skapa meddelandet med användarens username från JWT
    const newMessage = await Chat.createMessage(participantId, req.user.username, message);
    console.log('Nytt meddelande skapat:', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Fel vid skapande av meddelande:', error);
    res.status(500).json({ message: 'Kunde inte skicka meddelandet', error: error.message });
  }
};

// Markera meddelanden som lästa när chatt öppnas
const markMessagesAsRead = async (req, res) => {
  const participantId = req.params.participantId;

  try {
    if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

    await Chat.markMessagesAsRead(participantId);
    console.log(`Meddelanden för deltagare ${participantId} har markerats som lästa`);
    res.status(200).json({ message: 'Meddelanden markerade som lästa' });
  } catch (error) {
    console.error('Fel vid markering av meddelanden:', error);
    res.status(500).json({ message: 'Kunde inte markera meddelanden som lästa', error: error.message });
  }
};

module.exports = {
  getChatMessages,
  postChatMessage,
  getAllChatMessages,
  markMessagesAsRead,
};
