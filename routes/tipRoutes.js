const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');

router.post('/tips', tipController.createTip);
router.get('/tips', tipController.getTips);
router.delete('/tips/:id', tipController.deleteTip);

module.exports = router;
