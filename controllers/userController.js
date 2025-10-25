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
    console.log('🔹 Login request body:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('⚠️ Email eller lösenord saknas');
      return res.status(400).json({ error: 'Email och lösenord krävs' });
    }

    const user = await userModel.getUserByEmail(email);
    console.log('🔹 Hittad användare:', user);

    // Logga login attempt (initialt false)
    await loginAttemptModel.logLoginAttempt(email, false);
    console.log('🔹 Login attempt initialt loggad som false');

    if (!user) {
      console.log('❌ Användaren hittades inte');
      return res.status(404).json({ error: 'Användare inte hittad' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔹 Lösenordsjämförelse resultat:', isMatch);

    if (!isMatch) {
      console.log('❌ Felaktigt lösenord');
      return res.status(401).json({ error: 'Felaktigt lösenord' });
    }

    // Skapa JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log('🔹 JWT skapad:', token);

    // Sätt cookies
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 8 * 60 * 60 * 1000, // 8h
    });
    console.log('🔹 Cookie "token" satt');

    if (user.participant_id) {
      res.cookie('participant_id', user.participant_id, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        maxAge: 8 * 60 * 60 * 1000,
      });
      console.log('🔹 Cookie "participant_id" satt:', user.participant_id);
    }

    // Uppdatera login attempt till true
    await loginAttemptModel.logLoginAttempt(email, true);
    console.log('🔹 Login attempt uppdaterad till true');

    // Returnera info till frontend
    return res.json({
      message: 'Inloggning lyckades!',
      username: user.username,
      role: user.role,
      admin: user.admin || false
    });

  } catch (err) {
    console.error('❌ Fel vid inloggning:', err);
    return res.status(500).json({ error: 'Serverfel vid inloggning' });
  }
};

// 🟢 REGISTER
const registerUser = async (req, res) => {
  try {
    console.log('🔹 Register request body:', req.body);

    const { email, username, password, role, personalNumber } = req.body;

    if (!email || !username || !password) {
      console.log('⚠️ Email, username eller password saknas');
      return res.status(400).json({ error: 'Email, användarnamn och lösenord krävs' });
    }

    const userRole = role || 'user';

    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!usernameRegex.test(username)) {
      console.log('❌ Ogiltigt användarnamn:', username);
      return res.status(400).json({ error: 'Ogiltigt användarnamn (minst 3 tecken, inga specialtecken)' });
    }

    const existingUser = await userModel.getUserByUsername(username);
    console.log('🔹 Kontroll av existerande användare:', existingUser);
    if (existingUser) {
      console.log('❌ Användarnamn eller email redan registrerad');
      return res.status(409).json({ error: 'Användarnamnet eller e-posten är redan registrerad' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('❌ Lösenordet uppfyller inte krav');
      return res.status(400).json({ error: 'Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en siffra och ett specialtecken' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔹 Lösenord hashad');

    const newUserData = { email, username, password: hashedPassword, role: userRole };
    if (userRole === 'deltagare' && personalNumber) newUserData.personalNumber = personalNumber;

    const newUser = await userModel.createUser(newUserData);
    console.log('🔹 Ny användare skapad:', newUser);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log('🔹 JWT för ny användare skapad:', token);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 8 * 60 * 60 * 1000,
    });
    console.log('🔹 Cookie "token" satt vid registrering');

    return res.status(201).json({
      message: 'Registrering lyckades',
      username: newUser.username,
      role: newUser.role
    });

  } catch (err) {
    console.error('❌ Fel vid registrering:', err);
    return res.status(500).json({ error: 'Serverfel vid registrering' });
  }
};

module.exports = { loginUser, registerUser, loginRateLimiter };
