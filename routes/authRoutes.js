const express = require('express');
const { loginUser, registerUser, loginRateLimiter } = require('../controllers/userController');
const { authenticateUser } = require('../middlewares/authMiddleware'); // Korrekt namn

const router = express.Router();

// 🔒 POST /auth/login med rate limiter
router.post('/login', loginRateLimiter, loginUser);

// 📝 POST /auth/register
router.post('/register', registerUser);

// 👤 GET /auth/userinfo – kräver JWT
router.get('/userinfo', authenticateUser, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const { id, username, role, participant_id, admin } = req.user;
  res.json({ id, username, role, participant_id, admin });
});

module.exports = router;
