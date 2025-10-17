const express = require('express');
const router = express.Router();
const {
  saveOrUpdateCompletedSteps,
  getCompletedSteps
} = require('../controllers/completedStepController');

// POST för att spara eller uppdatera grundförutsättningar
router.post('/saveSteps', saveOrUpdateCompletedSteps);

// GET för att hämta sparade grundförutsättningar för en deltagare
router.get('/steps/:participantId', getCompletedSteps);

module.exports = router;
