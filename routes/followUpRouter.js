const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');

router.post('/send-followup', followUpController.createFollowUp);
// Skapar en ny uppföljning

router.get('/followups', followUpController.getAllFollowUps);
// Hämtar alla uppföljningar

router.get('/followups/email/:email', followUpController.getFollowUpsByEmail);
// Hämtar uppföljningar för specifik e-post

router.get('/followups/participant/:participantId', followUpController.getFollowUpsByParticipantId);
// Hämtar uppföljningar för en specifik deltagare via participantId


module.exports = router;
