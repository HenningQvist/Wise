// routes/protectedRoutes.js
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

// 🔹 1. Logga inkommande request
router.use((req, res, next) => {
  console.log('\n==============================');
  console.log('📥 NY REQUEST:', req.method, req.originalUrl);
  console.log('🔹 Origin:', req.headers.origin);
  console.log('🔹 Full URL:', `${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log('🔹 Headers:', req.headers);
  console.log('🔹 Inkommande cookies (före parser):', req.headers.cookie || '❌ Inga cookies i headers');
  console.log('==============================\n');
  next();
});

// 🔹 2. Cookie parser (måste vara först innan Passport)
router.use(cookieParser());

// 🔹 3. Passport JWT-auth (stöd för cookie eller Authorization-header)
router.use((req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) console.error('❌ Auth error:', err);
    if (info) console.warn('⚠️ Auth info:', info.message || info);

    req.user = user || null;

    console.log('🍪 Cookies efter parser:', req.cookies);
    console.log('👤 req.user efter auth:', req.user);

    next();
  })(req, res, next);
});

// 🔹 4. Skyddad test-rutt
router.get('/protected', (req, res) => {
  console.log('🧱 /protected endpoint körs');
  if (!req.user) {
    console.warn('🚫 Ej autentiserad → 401');
    return res.status(401).json({ message: 'Ej auktoriserad', cookies: req.cookies });
  }
  console.log('✅ Användaren är autentiserad → skicka svar');
  res.json({
    message: 'Det här är en skyddad resurs',
    user: req.user,
  });
});

// 🔹 5. Andra skyddade rutter
router.use((req, res, next) => {
  console.log('➡️ Routing till undersystem:', req.originalUrl);
  next();
});
router.use(participantRoutes);
router.use(insatsRouter);
router.use(tipRoutes);
router.use(loginRouter);
router.use(completedStepRoutes);
router.use(statisticsRoutes);
router.use(networkRoutes);
router.use(followUpRouter);
router.use(summaryRoutes);

// 🔹 6. Admin-rutter med rollkontroll
router.use((req, res, next) => {
  console.log('👮 Kontroll av adminrättigheter...');
  next();
});
router.use(hasAdminRights);
router.use(adminRoutes);

// 🔹 7. Global felhantering
router.use((err, req, res, next) => {
  console.error('💥 FEL I PROTECTED ROUTES:', err);
  res.status(500).json({ error: 'Internt serverfel', details: err.message });
});

module.exports = router;
