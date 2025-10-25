// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { loginUser, registerUser, loginRateLimiter } = require('../controllers/userController');

const router = express.Router();

router.post('/login', loginRateLimiter, loginUser);
router.post('/register', registerUser);

router.get('/userinfo', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  const { id, username, role, participant_id } = req.user;
  res.json({ id, username, role, participant_id });
});

module.exports = router;
