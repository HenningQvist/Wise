// routes/summaryRoutes.js
const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');

router.post('/saveSummary', summaryController.saveSummary);
router.get('/participants/:participantId/summary', summaryController.getSummary);

module.exports = router;
