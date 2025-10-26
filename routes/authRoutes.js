// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { loginUser, registerUser, loginRateLimiter } = require('../controllers/userController');

const router = express.Router();

// 🔹 POST /login med rate limiter
router.post('/login', loginRateLimiter, loginUser);

// 🔹 POST /register
router.post('/register', registerUser);

// 🔹 GET /userinfo - skyddad route
router.get(
  '/userinfo',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // Debug: logga cookies och header
    console.log('🍪 Cookies:', req.cookies);
    console.log('🔑 Authorization-header:', req.headers.authorization);

    if (!req.user) {
      console.warn('🚫 Ej autentiserad användare försökte nå /userinfo');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { id, username, email, role, participant_id } = req.user;
    res.json({ id, username, email, role, participant_id });
  }
);

module.exports = router;
