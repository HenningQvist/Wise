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

const hasAdminRights = require('../middlewares/roleMiddleware'); 
const router = express.Router();

// Middleware för cookies och autentisering
router.use(cookieParser());

// Logga cookies på varje request för debug
router.use((req, res, next) => {
  console.log('🔹 Request cookies:', req.cookies);
  next();
});

// Passport JWT auth
router.use(passport.authenticate('jwt', { session: false }));

// Skyddad rutt med debug
router.get('/protected', (req, res) => {
  console.log('🔹 /protected accessed');
  console.log('🔹 req.user:', req.user);
  
  if (!req.user) {
    console.log('⚠️ Ingen JWT hittades eller den är ogiltig');
    return res.status(401).json({ message: 'Ej auktoriserad' });
  }

  res.json({
    message: 'Det här är en skyddad resurs',
    user: req.user
  });
});

// Inkludera övriga skyddade rutter
router.use(participantRoutes);
router.use(insatsRouter);
router.use(tipRoutes);
router.use(loginRouter);
router.use(completedStepRoutes);
router.use(statisticsRoutes);
router.use(networkRoutes);
router.use(followUpRouter);
router.use(summaryRoutes);

// Admin-middleware före admin-rutterna
router.use(hasAdminRights); 
router.use(adminRoutes);

module.exports = router;
