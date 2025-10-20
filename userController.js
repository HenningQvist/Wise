const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const userModel = require('../models/userModel');
const loginAttemptModel = require('../models/loginAttempt');

// 🕒 Rate limiter för login
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'För många inloggningsförsök. Försök igen om 15 minuter.',
});

// 🔐 Logga in användare
const loginUser = async (req, res) => {
  console.log('📥 Login payload:', req.body);
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email och lösenord krävs' });

    const user = await userModel.getUserByEmail(email);
    console.log('🔹 Hittad användare:', user);

    // logga försök oavsett resultat
    await loginAttemptModel.logLoginAttempt(email, false);

    if (!user) return res.status(404).json({ error: 'Användare inte hittad' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔹 Lösenords-match:', isMatch);

    if (!isMatch)
      return res.status(401).json({ error: 'Felaktigt lösenord' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 3600000,
    });

    await loginAttemptModel.logLoginAttempt(email, true);

    return res.json({
      message: 'Inloggning lyckades!',
      role: user.role,
      username: user.username,
      admin: user.admin,
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

    // Grundläggande validering
    if (!email || !username || !password)
      return res.status(400).json({ error: 'Email, användarnamn och lösenord krävs' });

    // Validera användarnamn
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username) || username.length < 3)
      return res.status(400).json({ error: 'Ogiltigt användarnamn (minst 3 tecken, inga specialtecken)' });

    // Kontrollera om användaren redan finns via username eller email
    const existingUserByName = await userModel.getUserByUsername(username);
    const existingUserByEmail = await userModel.getUserByEmail(email);

    if (existingUserByName || existingUserByEmail)
      return res.status(409).json({ error: 'Användarnamnet eller e-posten är redan registrerad' });

    // Lösenordsvalidering
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password))
      return res.status(400).json({
        error:
          'Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en siffra och ett specialtecken',
      });

    // Hasha lösenord
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔹 Hashat lösenord genererat');

    // Skapa användardata — viktigt: skicka `password: hashedPassword`
    const newUserData = {
      email,
      username,
      password: hashedPassword, // ✅ rätt fältnamn
      role: role || 'user',
    };

    if (role === 'deltagare' && personalNumber)
      newUserData.personalNumber = personalNumber;

    console.log('🔹 Skapar användare med data:', {
      ...newUserData,
      password: '[HASHED]',
    });

    // Skapa användaren i databasen
    const newUser = await userModel.createUser(newUserData);
    console.log('✅ Ny användare skapad i DB:', newUser);

    // Skapa JWT
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
