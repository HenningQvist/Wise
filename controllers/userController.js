// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const userModel = require('../models/userModel');
const loginAttemptModel = require('../models/loginAttempt');

// 🕒 Begränsa inloggningsförsök
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: 5,
  message: 'För många inloggningsförsök. Försök igen om 15 minuter.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip, // Använd IP bakom proxy
});

// 🧾 Logga in användare
const loginUser = async (req, res) => {
  console.log('📥 Login payload:', req.body);

  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email och lösenord krävs' });

    const user = await userModel.getUserByEmail(email);
    console.log('🔹 Hittad användare:', user);

    if (!user) {
      await loginAttemptModel.logLoginAttempt(email, false);
      return res.status(404).json({ error: 'Användare inte hittad' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔹 Lösenords-match:', isMatch);

    if (!isMatch) {
      await loginAttemptModel.logLoginAttempt(email, false);
      return res.status(401).json({ error: 'Felaktigt lösenord' });
    }

    await loginAttemptModel.logLoginAttempt(email, true);

    // Skapa JWT-token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    // Lägg till participant_id om det finns
    if (user.role === 'deltagare' && user.participant_id) {
      tokenPayload.participant_id = user.participant_id;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 3600000,
    });

    return res.json({
      message: 'Inloggning lyckades!',
      role: user.role,
      username: user.username,
      participant_id: user.participant_id || null,
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ error: 'Serverfel vid inloggning' });
  }
};

// 🧾 Registrera användare
const registerUser = async (req, res) => {
  console.log('📥 Registreringspayload:', req.body);

  try {
    const { email, username, password, role, personalNumber } = req.body;

    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: 'Email, användarnamn och lösenord krävs' });
    }

    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username) || username.length < 3) {
      return res.status(400).json({
        error: 'Ogiltigt användarnamn (minst 3 tecken, inga specialtecken)',
      });
    }

    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser)
      return res.status(409).json({ error: 'Användarnamnet är redan registrerat' });

    const existingEmail = await userModel.getUserByEmail(email);
    if (existingEmail)
      return res.status(409).json({ error: 'E-postadressen är redan registrerad' });

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          'Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en siffra och ett specialtecken',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUserData = {
      email,
      username,
      password: hashedPassword,
      role: role || 'user',
      personalNumber: role === 'deltagare' ? personalNumber : null,
    };

    const newUser = await userModel.createUser(newUserData);

    const tokenPayload = {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role,
    };
    if (newUser.role === 'deltagare' && newUser.participant_id) {
      tokenPayload.participant_id = newUser.participant_id;
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.status(201).json({ message: 'Registrering lyckades', token });
  } catch (err) {
    console.error('❌ Fel vid registrering:', err);
    return res.status(500).json({ error: 'Serverfel vid registreringen' });
  }
};

// 🔒 Skyddad rutt
const protectedRoute = (req, res) => {
  console.log('🔒 Skyddad rutt accessed av:', req.user);
  res.json({ message: 'Det här är en skyddad resurs', user: req.user });
};

module.exports = {
  loginUser,
  registerUser,
  protectedRoute,
  loginRateLimiter,
};
