const express = require('express');
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

const passport = require('../config/passport');
const hasAdminRights = require('../middlewares/roleMiddleware');

const router = express.Router();

// 🔒 Alla rutter kräver JWT via Passport
router.use(passport.authenticate('jwt', { session: false }));

// Test-rutt
router.get('/protected', (req, res) => {
  res.json({ message: 'Det här är en skyddad resurs', user: req.user });
});

// Andra skyddade rutter
router.use(participantRoutes);
router.use(insatsRouter);
router.use(tipRoutes);
router.use(loginRouter);
router.use(completedStepRoutes);
router.use(statisticsRoutes);
router.use(networkRoutes);
router.use(followUpRouter);
router.use(summaryRoutes);

// 🔑 Admin-rutter
router.use(hasAdminRights);
router.use(adminRoutes);

module.exports = router;
