const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const userModel = require('../models/userModel');
const loginAttemptModel = require('../models/loginAttempt');

// 🕒 Begränsa inloggningsförsök
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: 'För många inloggningsförsök. Försök igen om 15 minuter.',
});

// 🧾 Logga in användare
const loginUser = async (req, res) => {
  console.log('📥 Login payload:', req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email och lösenord krävs' });

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

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 3600000 });
    return res.json({ message: 'Inloggning lyckades!', role: user.role, username: user.username });
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

    // ✅ Validering av obligatoriska fält
    if (!email || !username || !password) {
      console.warn('⚠️ Saknar obligatoriska fält');
      return res.status(400).json({ error: 'Email, användarnamn och lösenord krävs' });
    }

    // ✅ Användarnamn-validering
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username) || username.length < 3) {
      console.warn('⚠️ Ogiltigt användarnamn:', username);
      return res.status(400).json({ error: 'Ogiltigt användarnamn (minst 3 tecken, inga specialtecken)' });
    }

    // ✅ Kolla om användaren redan finns
    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      console.warn('⚠️ Användarnamn redan registrerat:', username);
      return res.status(409).json({ error: 'Användarnamnet är redan registrerat' });
    }

    const existingEmail = await userModel.getUserByEmail(email);
    if (existingEmail) {
      console.warn('⚠️ E-post redan registrerad:', email);
      return res.status(409).json({ error: 'E-postadressen är redan registrerad' });
    }

    // ✅ Validera lösenord
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      console.warn('⚠️ Ogiltigt lösenord:', password);
      return res.status(400).json({ error: 'Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en siffra och ett specialtecken' });
    }

    // ✅ Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔹 Hashat lösenord:', hashedPassword);

    // ✅ Skapa användardata (lösenord inkluderas!)
    const newUserData = {
      email,
      username,
      password: hashedPassword,
      role: role || 'user',
      personalNumber: role === 'deltagare' ? personalNumber : null
    };

    console.log('🔹 Skapar användare med data:', newUserData);

    // ✅ Skapa användaren i databasen
    const newUser = await userModel.createUser(newUserData);
    console.log('✅ Ny användare skapad:', newUser);

    // ✅ Skapa JWT-token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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

module.exports = { loginUser, registerUser, protectedRoute, loginRateLimiter };
