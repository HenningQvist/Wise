const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const participantRoutes = require('./participantRoutes'); 
const insatsRouter = require('./insatsRouter');
const tipRoutes = require('./tipRoutes');
const adminRoutes = require('./adminRoutes');
const loginRouter = require('./loginRouter');
const completedStepRoutes = require('./completedStepRoutes');
const statisticsRoutes = require('./statisticsRoutes');
const networkRoutes = require('./networkRoutes');
const followUpRouter = require('./followUpRouter');
const summaryRoutes = require('./summaryRoutes');

const hasAdminRights = require('../middlewares/roleMiddleware'); // Importera admin-middleware
const router = express.Router();

// Middleware för att hantera cookies och autentisering
router.use(cookieParser());
router.use(passport.authenticate('jwt', { session: false }));

// Skyddad rutt
router.get('/protected', (req, res) => {
  console.log('Received request to /protected');
  if (!req.user) {
    return res.status(401).json({ message: 'Ej auktoriserad' });
  }
  res.json({
    message: 'Det här är en skyddad resurs',
    user: req.user
  });
});

// Inkludera andra skyddade rutter
router.use(participantRoutes);
router.use(insatsRouter);
router.use(tipRoutes);
router.use(loginRouter);
router.use(completedStepRoutes);
router.use(statisticsRoutes);
router.use(networkRoutes);
router.use(followUpRouter);
router.use(summaryRoutes);


// Lägg till admin-middleware FÖRE admin-rutterna
router.use(hasAdminRights); // Kollar om användaren är admin innan de får åtkomst
router.use(adminRoutes); // Alla admin-rutter skyddas nu automatiskt

module.exports = router;
