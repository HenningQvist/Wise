const jwt = require('jsonwebtoken');
const Rating = require('../models/ratings.model'); // Importera Rating-modellen

// Spara eller uppdatera ratings för en deltagare
const saveRatings = async (req, res) => {
  try {
    const { participantId } = req.params; // Hämta participantId från URL
    const ratings = req.body; // Hämta ratings från request body

    // Kontrollera om ratings finns i request body
    if (!ratings || Object.keys(ratings).length === 0) {
      return res.status(400).json({
        message: 'Rating data saknas i request body',
      });
    }

    // Kontrollera om alla nödvändiga ratings fält finns
    const requiredFields = [
      'hantering_av_vardagen',
      'hälsa',
      'koncentrationsförmåga',
      'tro_på_att_få_jobb',
      'stöd_från_nätverk',
      'samarbetsförmåga',
      'jobbsökningsbeteende',
      'kunskap_om_arbetsmarknaden',
      'målmedvetenhet',
    ];

    for (let field of requiredFields) {
      if (!ratings[field]) {
        return res.status(400).json({
          message: `Fältet ${field} saknas i request body`,
        });
      }
    }

    // Hämta token från cookies
    const token = req.cookies['token'];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifiera JWT och få den dekodade användardatan
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    // Spara rating i databasen med Rating.save()
    const savedRating = await Rating.save(participantId, ratings);

    return res.status(201).json({
      message: 'Skattningar sparade!',
      data: savedRating,
    });
  } catch (error) {
    console.error('❌ Fel vid sparande av ratings:', error);
    return res.status(500).json({
      message: 'Det gick inte att spara skattningar',
      error: error.message,
    });
  }
};

// Hämta den senaste rating för en deltagare
const getLatestRating = async (req, res) => {
  try {
    const { participantId } = req.params; // Hämta participantId från URL

    // Hämta token från cookies
    const token = req.cookies['token'];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifiera JWT och få den dekodade användardatan
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    // Hämta den senaste rating för deltagaren med Rating.getByUserId()
    const rating = await Rating.getByUserId(participantId);
    if (!rating) {
      return res.status(404).json({ message: 'Ingen rating hittades för deltagaren.' });
    }

    return res.json(rating); // Returnera den senaste ratingen om den finns
  } catch (error) {
    console.error('❌ Fel vid hämtning av senaste rating:', error);
    return res.status(500).json({ message: 'Serverfel vid hämtning av rating' });
  }
};

// Hämta första och senaste rating
const getFirstAndLatestRating = async (req, res) => {
  try {
    const { participantId } = req.params;

    // Hämta token från cookies
    const token = req.cookies['token'];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifiera JWT och få den dekodade användardatan
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    // Hämta första och senaste ratingen
    const firstRating = await Rating.getFirstByUserId(participantId);
    const latestRating = await Rating.getByUserId(participantId);

    if (!firstRating || !latestRating) {
      return res.status(404).json({ message: 'Kunde inte hitta både första och senaste ratingen.' });
    }

    return res.json({ firstRating, latestRating });
  } catch (error) {
    console.error('❌ Fel vid hämtning av första och senaste rating:', error);
    return res.status(500).json({ message: 'Serverfel vid hämtning av rating' });
  }
};

// Hämta alla ratings för en deltagare
const getAllRatings = async (req, res) => {
  try {
    const { participantId } = req.params;

    // Hämta token från cookies
    const token = req.cookies['token'];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verifiera JWT och få den dekodade användardatan
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    console.log('🔹 Token verifierad:', decoded);

    // Hämta alla ratingar för den angivna deltagaren
    const allRatings = await Rating.getAllByUserId(participantId);

    if (!allRatings || allRatings.length === 0) {
      return res.status(404).json({ message: 'Kunde inte hitta några ratingar.' });
    }

    return res.json({ allRatings });
  } catch (error) {
    console.error('❌ Fel vid hämtning av alla ratingar:', error);
    return res.status(500).json({ message: 'Serverfel vid hämtning av ratingar' });
  }
};

// Exportera funktionerna
module.exports = { saveRatings, getLatestRating, getFirstAndLatestRating, getAllRatings };
