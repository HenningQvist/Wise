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

const { authenticateUser } = require('../middlewares/authMiddleware'); // JWT-middleware
const hasAdminRights = require('../middlewares/roleMiddleware'); // Admin-middleware

const router = express.Router();

// 🔒 Alla rutter under denna middleware kräver JWT
router.use(authenticateUser);

// Skyddad test-rutt
router.get('/protected', (req, res) => {
  console.log('Received request to /protected');
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

// 🔑 Admin-rutter kräver först JWT och sedan admin-rights
router.use(hasAdminRights);
router.use(adminRoutes);

module.exports = router;
