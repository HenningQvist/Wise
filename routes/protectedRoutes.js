const express = require('express');
const passport = require('passport');

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

// ✅ Skyddad test-rutt
router.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log('🔹 /protected accessed by:', req.user?.username || 'unknown');
    if (!req.user) return res.status(401).json({ message: 'Ej auktoriserad' });

    res.json({
      message: 'Det här är en skyddad resurs',
      user: req.user
    });
  }
);

// ✅ Skyddade rutter med JWT
router.use(passport.authenticate('jwt', { session: false }));

router.use(participantRoutes);
router.use(insatsRouter);
router.use(tipRoutes);
router.use(loginRouter);
router.use(completedStepRoutes);
router.use(statisticsRoutes);
router.use(networkRoutes);
router.use(followUpRouter);
router.use(summaryRoutes);

// ✅ Admin-rutter
router.use('/admin', passport.authenticate('jwt', { session: false }), hasAdminRights, adminRoutes);

module.exports = router;
