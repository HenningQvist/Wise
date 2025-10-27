// routes/insatsRouter.js

const express = require('express');
const router = express.Router();
const passport = require('../config/passport');

const { createInsatsController, getAllInsatserController, upload } = require('../controllers/insatsController');
const { 
  createSelectedInsatserController, 
  getSelectedInsatserController, 
  getAllSelectedInsatserController 
} = require('../controllers/selectedInsatserController');
const { createDecision, getAllDecisions, endInsats } = require('../controllers/decisionsController');

// 🔒 Alla rutter här kräver JWT via Passport
router.use(passport.authenticate('jwt', { session: false }));

// Test-rutt
router.get('/protected-insats', (req, res) => {
  res.json({ message: 'Det här är en skyddad insats-resurs', user: req.user });
});

// ------------------------
// INSATSER
// ------------------------

// Skapa ny insats med uppladdning av filer
router.post('/insatser', upload.array('files'), createInsatsController);

// Hämta alla insatser
router.get('/insatser', getAllInsatserController);

// ------------------------
// VALDA INSATSER
// ------------------------

// Spara valda insatser för en deltagare
router.post('/selected-insatser', createSelectedInsatserController);

// Hämta alla valda insatser
router.get('/selected-insatser', getAllSelectedInsatserController);

// Hämta valda insatser för en specifik deltagare
router.get('/selected-insatser/:participantId', getSelectedInsatserController);

// ------------------------
// BESLUT
// ------------------------

// Skapa nytt beslut för en deltagare + insats
router.post('/decisions/:participantId/:insatsId', createDecision);

// Hämta alla beslut för en deltagare + insats
router.get('/decisions/:participantId/:insatsId', getAllDecisions);

// ------------------------
// AVSLUTA INSATS
// ------------------------

// Avsluta en insats
router.post('/end-insats/:insatsId', endInsats);

module.exports = router;
