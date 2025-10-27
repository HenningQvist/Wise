const { createInsats, addFilesToInsats, getAllInsatser } = require('../models/insatsModel');
const multer = require('multer');

// Multer-konfiguration för filuppladdning
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ange mappen där filer ska sparas
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Ge filen ett unikt namn
  }
});

const upload = multer({ storage: storage });

// 🔒 Skapa en ny Insats
const createInsatsController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  const {
    name,
    focusType,
    description,
    combineWith,
    insats_type1,
    insats_type2,
    insats_type3,
    insats_type4,
    insats_type5,
    startDate,
    endDate,
    lastDate,
    responsible
  } = req.body;

  try {
    const insatsData = {
      name,
      focusType,
      description,
      combineWith,
      insatsType1: insats_type1,
      insatsType2: insats_type2,
      insatsType3: insats_type3,
      insatsType4: insats_type4,
      insatsType5: insats_type5,
      startDate,
      endDate,
      lastDate,
      responsible,
      createdBy: req.user.username // ← sparar vem som skapade insatsen
    };

    const newInsatsId = await createInsats(insatsData);

    if (req.files && req.files.length > 0) {
      await addFilesToInsats(newInsatsId, req.files);
    }

    res.status(201).json({
      message: 'Insats skapad framgångsrikt!',
      insatsId: newInsatsId
    });
  } catch (error) {
    console.error('Fel vid skapande av insats:', error);
    res.status(500).json({ error: 'Fel vid skapande av insats' });
  }
};

// 🔒 Hämta alla insatser inklusive filer
const getAllInsatserController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Ingen åtkomst: användaren ej autentiserad' });
  }

  try {
    const insatser = await getAllInsatser(); // Modellen hämtar filer via JOIN
    res.status(200).json({
      message: '✅ Insatser och tillhörande filer hämtades framgångsrikt!',
      insatser: insatser
    });
  } catch (error) {
    console.error('❌ Fel vid hämtning av insatser:', error);
    res.status(500).json({ error: 'Fel vid hämtning av insatser' });
  }
};

module.exports = {
  createInsatsController,
  getAllInsatserController,
  upload
};
