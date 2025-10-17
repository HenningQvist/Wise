const Chat = require('../models/chatModel');

// Hämtar meddelanden för en specifik deltagare
const getChatMessages = async (req, res) => {
  const participantId = req.params.participantId;
  console.log('Försöker hämta meddelanden för deltagare:', participantId);

  try {
    const messages = await Chat.getMessagesByParticipant(participantId);
    console.log('Meddelanden hämtade:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Fel vid hämtning av meddelanden:', error);
    res.status(500).json({ message: 'Kunde inte hämta meddelanden' });
  }
};

// Hämtar alla meddelanden för alla deltagare
const getAllChatMessages = async (req, res) => {
  try {
    const messages = await Chat.getAllMessages();
    console.log('Alla meddelanden hämtade:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Fel vid hämtning av alla meddelanden:', error);
    res.status(500).json({ message: 'Kunde inte hämta alla meddelanden' });
  }
};

// Skickar ett nytt meddelande
const postChatMessage = async (req, res) => {
  const participantId = req.params.participantId;
  const { message, sender } = req.body;

  console.log('Försöker skicka meddelande för deltagare:', participantId);
  console.log('Meddelande som skickas:', message);
  console.log('Sender (användarnamn):', sender);

  if (!message || message.trim() === '') {
    console.log('Meddelandet var tomt eller ogiltigt');
    return res.status(400).json({ message: 'Meddelandet får inte vara tomt' });
  }

  try {
    // Skapa meddelandet och sätt det till oläst
    const newMessage = await Chat.createMessage(participantId, sender, message);
    console.log('Nytt meddelande skapat:', newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Fel vid skapande av meddelande:', error);
    res.status(500).json({ message: 'Kunde inte skicka meddelandet' });
  }
};

// Markera meddelanden som lästa när chatt öppnas
const markMessagesAsRead = async (req, res) => {
  const participantId = req.params.participantId;

  try {
    await Chat.markMessagesAsRead(participantId);
    console.log(`Meddelanden för deltagare ${participantId} har markerats som lästa`);
    res.status(200).json({ message: 'Meddelanden markerade som lästa' });
  } catch (error) {
    console.error('Fel vid markering av meddelanden:', error);
    res.status(500).json({ message: 'Kunde inte markera meddelanden som lästa' });
  }
};

module.exports = {
  getChatMessages,
  postChatMessage,
  getAllChatMessages,
  markMessagesAsRead,
};
