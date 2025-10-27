const Rating = require('../models/ratings.model'); // Importera Rating-modellen

// 🔒 Spara eller uppdatera ratings för en deltagare
const saveRatings = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  try {
    const { participantId } = req.params;
    const ratings = req.body;

    if (!ratings || Object.keys(ratings).length === 0) {
      return res.status(400).json({ message: 'Rating data saknas i request body' });
    }

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
      if (ratings[field] === undefined) {
        return res.status(400).json({ message: `Fältet ${field} saknas i request body` });
      }
    }

    // Använd req.user.username som skapare/uppdaterare om du vill logga det
    const savedRating = await Rating.save(participantId, ratings);

    res.status(201).json({ message: 'Skattningar sparade!', data: savedRating });
  } catch (error) {
    console.error('❌ Fel vid sparande av ratings:', error);
    res.status(500).json({ message: 'Det gick inte att spara skattningar', error: error.message });
  }
};

// 🔒 Hämta den senaste rating för en deltagare
const getLatestRating = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  try {
    const { participantId } = req.params;
    const rating = await Rating.getByUserId(participantId);

    if (!rating) {
      return res.status(404).json({ message: 'Ingen rating hittades för deltagaren.' });
    }

    res.json(rating);
  } catch (error) {
    console.error('❌ Fel vid hämtning av senaste rating:', error);
    res.status(500).json({ message: 'Serverfel vid hämtning av rating' });
  }
};

// 🔒 Hämta första och senaste rating för en deltagare
const getFirstAndLatestRating = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  try {
    const { participantId } = req.params;
    const firstRating = await Rating.getFirstByUserId(participantId);
    const latestRating = await Rating.getByUserId(participantId);

    if (!firstRating || !latestRating) {
      return res.status(404).json({ message: 'Kunde inte hitta både första och senaste ratingen.' });
    }

    res.json({ firstRating, latestRating });
  } catch (error) {
    console.error('❌ Fel vid hämtning av första och senaste rating:', error);
    res.status(500).json({ message: 'Serverfel vid hämtning av rating' });
  }
};

// 🔒 Hämta alla ratings för en deltagare
const getAllRatings = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  try {
    const { participantId } = req.params;
    const allRatings = await Rating.getAllByUserId(participantId);

    if (!allRatings || allRatings.length === 0) {
      return res.status(404).json({ message: 'Kunde inte hitta några ratingar.' });
    }

    res.json({ allRatings });
  } catch (error) {
    console.error('❌ Fel vid hämtning av alla ratingar:', error);
    res.status(500).json({ message: 'Serverfel vid hämtning av ratingar' });
  }
};

module.exports = { saveRatings, getLatestRating, getFirstAndLatestRating, getAllRatings };
