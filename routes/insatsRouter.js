// routes/insatsRoutes.js

const express = require('express');
const router = express.Router();
const { createInsatsController, getAllInsatserController, upload } = require('../controllers/insatsController');
const { createSelectedInsatserController, getSelectedInsatserController, getAllSelectedInsatserController } = require('../controllers/selectedInsatserController');
const { createDecision, getAllDecisions } = require('../controllers/decisionsController');
const { endInsats } = require('../controllers/decisionsController');

// Skapa ny insats
router.post('/insatser', upload.array('files'), createInsatsController);

// Hämta alla insatser
router.get('/insatser', getAllInsatserController);

// POST - spara valda insatser för en deltagare
router.post('/selected-insatser', createSelectedInsatserController);

router.get('/selected-insatser', getAllSelectedInsatserController);

// GET - Hämta valda insatser för en specifik deltagare
router.get('/selected-insatser/:participantId', getSelectedInsatserController);

// POST-rutt för att skapa ett nytt beslut (med både participantId och insatsId)
router.post('/decisions/:participantId/:insatsId', createDecision);

// GET-rutt för att hämta alla beslut för en viss deltagare och insats
router.get('/decisions/:participantId/:insatsId', getAllDecisions);

// Route för att avsluta en insats
router.post('/end-insats/:insatsId', endInsats);  // Använd post för att avsluta en insats

module.exports = router;
