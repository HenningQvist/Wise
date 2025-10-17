const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController'); // Se till att du importerar controller korrekt
const hasAdminRights = require('../middlewares/roleMiddleware'); // Importera middleware om nödvändigt

// Hämta alla användare, kräver adminbehörighet
router.get('/users', hasAdminRights, adminController.getUsers);

// Uppdatera en användare
router.put('/users/:id', adminController.updateUser);

// Ta bort en användare
router.delete('/users/:id', adminController.deleteUser);

// Skapa en handläggare
router.post('/users/handler', adminController.createHandler);

router.get('/users/:id', hasAdminRights, adminController.getUserById);

module.exports = router;
