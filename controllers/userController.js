const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const userModel = require('../models/userModel');
const loginAttemptModel = require('../models/loginAttempt');

// Rate limiter för login-försök
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: 5,
  message: 'För många inloggningsförsök. Försök igen om 15 minuter.',
});

// 🟢 LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email och lösenord krävs' });
    }

    const user = await userModel.getUserByEmail(email);

    // Logga login attempt (initialt false)
    await loginAttemptModel.logLoginAttempt(email, false);

    if (!user) return res.status(404).json({ error: 'Användare inte hittad' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Felaktigt lösenord' });

    // Skapa JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Sätt cookies
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 8 * 60 * 60 * 1000, // 8h
    });

    if (user.participant_id) {
      res.cookie('participant_id', user.participant_id, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        maxAge: 8 * 60 * 60 * 1000,
      });
    }

    // Uppdatera login attempt till true
    await loginAttemptModel.logLoginAttempt(email, true);

    // Returnera info till frontend
    return res.json({
      message: 'Inloggning lyckades!',
      username: user.username,
      role: user.role,
      admin: user.admin || false
    });

  } catch (err) {
    console.error('Fel vid inloggning:', err);
    return res.status(500).json({ error: 'Serverfel vid inloggning' });
  }
};

// 🟢 REGISTER
const registerUser = async (req, res) => {
  try {
    const { email, username, password, role, personalNumber } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, användarnamn och lösenord krävs' });
    }

    const userRole = role || 'user';

    // Validera användarnamn
    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Ogiltigt användarnamn (minst 3 tecken, inga specialtecken)' });
    }

    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) return res.status(409).json({ error: 'Användarnamnet eller e-posten är redan registrerad' });

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) return res.status(400).json({ error: 'Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en siffra och ett specialtecken' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUserData = { email, username, password: hashedPassword, role: userRole };
    if (userRole === 'deltagare' && personalNumber) newUserData.personalNumber = personalNumber;

    const newUser = await userModel.createUser(newUserData);

    // Skapa JWT
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Registrering lyckades',
      username: newUser.username,
      role: newUser.role
    });

  } catch (err) {
    console.error('Fel vid registrering:', err);
    return res.status(500).json({ error: 'Serverfel vid registrering' });
  }
};

module.exports = { loginUser, registerUser, loginRateLimiter };
