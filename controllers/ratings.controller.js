const Rating = require('../models/ratings.model'); // Importera Rating-modellen

// 🔒 Spara eller uppdatera ratings för en deltagare
const saveRatings = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  try {
    const { participantId } = req.params;
    const ratings = req.body;

    if (!ratings || Object.keys(ratings).length === 0) {
      return res.status(400).json({ message: 'Rating data saknas i request body' });
    }

    // Tillåt att vissa fält saknas
    const allowedFields = [
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

    const filteredRatings = {};
    for (let field of allowedFields) {
      if (ratings[field] !== undefined) {
        filteredRatings[field] = ratings[field];
      }
    }

    if (Object.keys(filteredRatings).length === 0) {
      return res.status(400).json({ message: 'Inga giltiga fält att spara' });
    }

    // Spara rating i databasen
    const savedRating = await Rating.save(participantId, filteredRatings);

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

// 🔒 Hämta den senaste rating för en deltagare
const getLatestRating = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  try {
    const { participantId } = req.params;
    const rating = await Rating.getByUserId(participantId);

    // Returnera alltid ett objekt, även om ingen rating finns
    if (!rating) {
      return res.json({
        exists: false,
        message: 'Ingen rating hittades ännu för deltagaren.',
        data: {}
      });
    }

    return res.json({
      exists: true,
      data: rating
    });
  } catch (error) {
    console.error('❌ Fel vid hämtning av senaste rating:', error);
    return res.status(500).json({ message: 'Serverfel vid hämtning av rating' });
  }
};

// 🔒 Hämta första och senaste rating
const getFirstAndLatestRating = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  try {
    const { participantId } = req.params;
    const firstRating = await Rating.getFirstByUserId(participantId);
    const latestRating = await Rating.getByUserId(participantId);

    return res.json({
      firstRating: firstRating || null,
      latestRating: latestRating || null,
      existsFirst: !!firstRating,
      existsLatest: !!latestRating
    });
  } catch (error) {
    console.error('❌ Fel vid hämtning av första och senaste rating:', error);
    return res.status(500).json({ message: 'Serverfel vid hämtning av rating' });
  }
};

// 🔒 Hämta alla ratings för en deltagare
const getAllRatings = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });

  try {
    const { participantId } = req.params;
    const allRatings = await Rating.getAllByUserId(participantId);

    return res.json({
      exists: allRatings && allRatings.length > 0,
      count: allRatings ? allRatings.length : 0,
      data: allRatings || []
    });
  } catch (error) {
    console.error('❌ Fel vid hämtning av alla ratingar:', error);
    return res.status(500).json({ message: 'Serverfel vid hämtning av ratingar' });
  }
};

module.exports = { saveRatings, getLatestRating, getFirstAndLatestRating, getAllRatings };
