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

const hasAdminRights = require('../middlewares/roleMiddleware'); // Admin-middleware

const router = express.Router();

// 🔹 Viktigt: cookie-parser FÖRE Passport
router.use(cookieParser());

// 🔹 Passport JWT-auth FÖRE alla skyddade rutter
router.use(passport.authenticate('jwt', { session: false }));

// 🔹 Skyddad test-rutt
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

// 🔹 Andra skyddade rutter
router.use(participantRoutes);
router.use(insatsRouter);
router.use(tipRoutes);
router.use(loginRouter);
router.use(completedStepRoutes);
router.use(statisticsRoutes);
router.use(networkRoutes);
router.use(followUpRouter);
router.use(summaryRoutes);

// 🔹 Admin-rutter (måste vara efter hasAdminRights)
router.use(hasAdminRights); // Kontrollera att användaren är admin
router.use(adminRoutes);

module.exports = router;
