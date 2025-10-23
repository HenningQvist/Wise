const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const pool = require('../config/database');
const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];

    if (!user || password !== user.password) { // ⚠️ byt mot bcrypt i produktion
      return res.status(401).json({ message: 'Ogiltig inloggning' });
    }

    // Skapa JWT
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Sätt cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 3600 * 1000
    });

    res.json({ message: 'Inloggning lyckades!', username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrering
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    await pool.query('INSERT INTO users(email, username, password) VALUES($1,$2,$3)', [email, username, password]);
    res.json({ message: 'Registrering lyckades!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
