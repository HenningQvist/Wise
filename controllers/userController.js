const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const userModel = require('../models/userModel');  // Importera User Model
const loginAttemptModel = require('../models/loginAttempt');  // Lägg till denna rad för att importera modellen


// Rate limiter för login-försök
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuter
  max: 5, // Tillåt 5 inloggningsförsök per IP
  message: 'För många inloggningsförsök. Försök igen om 15 minuter.',
});

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kontrollera om e-post och lösenord finns med i förfrågan
    if (!email || !password) {
      return res.status(400).json({ error: 'Email och lösenord krävs' });
    }

    // Hämta användaren från databasen med hjälp av e-post
    const user = await userModel.getUserByEmail(email);

    // Logga inloggningsförsöket oavsett om det lyckas eller inte
    await loginAttemptModel.logLoginAttempt(email, false);  // Första gången sätter vi success till false

    // Om användaren finns
    if (user) {
      // Jämför det angivna lösenordet med det hashade lösenordet i databasen
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // Skapa en JWT-token med användarens information
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            admin: user.admin  // Lägg till admin-fält i JWT-token
          },
          process.env.JWT_SECRET,  // Hämta JWT-hemlighet från miljövariabler
          { expiresIn: '1h' }     // Sätt livslängd på token till 1 timme
        );

        // Skicka token som en säker HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,         // Förhindrar JavaScript från att komma åt cookien
          secure: true,           // Tillåt endast HTTPS-anslutningar (rekommenderas även för utveckling)
          sameSite: 'None',       // Tillåt cookies mellan domäner (t.ex. frontend på annan port)
          maxAge: 3600000,        // Sätt cookiens livslängd till 1 timme
        });

        // Lägg till participant_id i en separat cookie
        res.cookie('participant_id', user.participant_id, {
          httpOnly: true,         // Förhindrar JavaScript från att komma åt cookien
          secure: true,           // Tillåt endast HTTPS-anslutningar (rekommenderas även för utveckling)
          sameSite: 'None',       // Tillåt cookies mellan domäner (t.ex. frontend på annan port)
          maxAge: 3600000,        // Sätt cookiens livslängd till 1 timme
        });

        // Uppdatera inloggningsförsöket till 'success' om det lyckades
        await loginAttemptModel.logLoginAttempt(email, true);  // Nu loggar vi med success = true

        // Skicka tillbaka användardata och admin-status i svaret
        return res.json({
          message: 'Inloggning lyckades!',
          role: user.role,
          username: user.username,
          admin: user.admin, // Skicka med admin-statusen i svaret
        });
      } else {
        // Om lösenordet inte matchar
        return res.status(401).json({ error: 'Felaktigt lösenord' });
      }
    } else {
      // Om användaren inte hittades
      return res.status(404).json({ error: 'Användare inte hittad' });
    }
  } catch (err) {
    // Hantera eventuella fel som kan uppstå
    console.error('Fel vid inloggning:', err);
    return res.status(500).json({ error: 'Serverfel vid inloggning' });
  }
};

// Registreringsfunktion
const registerUser = async (req, res) => {
  try {
    const { email, username, password, role, personalNumber } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, användarnamn och lösenord krävs' });
    }

    const userRole = role || 'user';

    // Validera användarnamn (t.ex. tillåt endast alfanumeriska tecken)
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    if (!usernameRegex.test(username) || username.length < 3) {
      return res.status(400).json({ error: 'Ogiltigt användarnamn (minst 3 tecken, inga specialtecken)' });
    }

    // Kontrollera om användaren redan finns i databasen
    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'Användarnamnet eller e-posten är redan registrerad' });
    }

    // Lösenordsvalidering med regex
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en siffra och ett specialtecken' });
    }

    // Kontrollera om lösenordet faktiskt finns och är en icke-null sträng
    if (!password || password.trim() === '') {
      return res.status(400).json({ error: 'Lösenordet kan inte vara tomt' });
    }

    // Hasha lösenordet säkert
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kontrollera om personalNumber ska inkluderas (om användaren är "deltagare")
    let newUserData = { email, username, hashedPassword, role: userRole };
    if (role === 'deltagare' && personalNumber) {
      newUserData.personalNumber = personalNumber;
    }

    // Skapa användaren i databasen
    const newUser = await userModel.createUser(newUserData);

    // Skapa JWT-token direkt efter registrering
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ message: 'Registrering lyckades', token });
  } catch (err) {
    console.error('Fel vid registrering:', err);
    return res.status(500).json({ error: 'Serverfel vid registreringen' });
  }
};



// Skyddad rutt
const protectedRoute = (req, res) => {
  res.json({ message: 'Det här är en skyddad resurs', user: req.user });
};

// Exportera controller
module.exports = { loginUser, registerUser, protectedRoute, loginRateLimiter };
