// authRoutes.js
const express = require('express');
const passport = require('passport');
const { loginUser, registerUser, loginRateLimiter } = require('../controllers/userController');

const router = express.Router();

// 🔹 Login med loggning
router.post('/login', loginRateLimiter, async (req, res, next) => {
  console.log('🔹 Login request body:', req.body);
  
  try {
    await loginUser(req, res);
    console.log('🔹 Login completed for:', req.body.email);
    console.log('🔹 Cookies sent in response:', res.getHeader('Set-Cookie')); // Logga cookies
  } catch (err) {
    console.error('❌ Error in login route:', err);
    next(err);
  }
});

// 🔹 Registrering med loggning
router.post('/register', async (req, res, next) => {
  console.log('🔹 Register request body:', req.body);
  
  try {
    await registerUser(req, res);
    console.log('🔹 Registration completed for:', req.body.email);
    console.log('🔹 Cookies sent in response:', res.getHeader('Set-Cookie')); // Logga cookies
  } catch (err) {
    console.error('❌ Error in register route:', err);
    next(err);
  }
});

// 🔹 Användarinfo (kontrollerad rutt)
router.get('/userinfo', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log('🔹 /userinfo accessed');
  console.log('🔹 Request cookies:', req.cookies);
  console.log('🔹 req.user:', req.user);

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { id, username, role, participant_id } = req.user;
  res.json({ id, username, role, participant_id });
});

module.exports = router;
