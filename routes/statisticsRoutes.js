const express = require('express');
const router = express.Router();

const { getCombinedStatistics,  getAllParticipants } = require('../controllers/statisticsController');

// Route för att hämta kombinerad data
router.get('/combined', getCombinedStatistics);


// Route för att hämta alla deltagare
router.get('/participants', getAllParticipants); // Ny route för att hämta alla deltagare

module.exports = router;
