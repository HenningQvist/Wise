const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔹 Login attempt:', email);

    if (!email || !password) {
      console.log('⚠️ Missing email or password');
      return res.status(400).json({ error: 'Email och lösenord krävs' });
    }

    const user = await userModel.getUserByEmail(email);
    console.log('🔹 User fetched from DB:', user);

    // Logga login attempt (initialt false)
    await loginAttemptModel.logLoginAttempt(email, false);

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'Användare inte hittad' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ error: 'Felaktigt lösenord' });
    }

    // Skapa JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log('🔹 JWT generated:', token);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 8 * 60 * 60 * 1000, // 8h
    });
    console.log('🔹 Token cookie set, secure:', isProd, 'sameSite:', isProd ? 'None' : 'Lax');

    if (user.participant_id) {
      res.cookie('participant_id', user.participant_id, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'None' : 'Lax',
        maxAge: 8 * 60 * 60 * 1000,
      });
      console.log('🔹 participant_id cookie set:', user.participant_id);
    }

    // Uppdatera login attempt till true
    await loginAttemptModel.logLoginAttempt(email, true);
    console.log('✅ Login attempt logged as successful');

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

// Registrering med loggar
const registerUser = async (req, res) => {
  try {
    const { email, username, password, role, personalNumber } = req.body;
    console.log('🔹 Register attempt:', email, username);

    if (!email || !username || !password) {
      console.log('⚠️ Missing email, username or password');
      return res.status(400).json({ error: 'Email, användarnamn och lösenord krävs' });
    }

    const userRole = role || 'user';
    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!usernameRegex.test(username)) {
      console.log('❌ Invalid username format');
      return res.status(400).json({ error: 'Ogiltigt användarnamn (minst 3 tecken, inga specialtecken)' });
    }

    const existingUser = await userModel.getUserByUsername(username);
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({ error: 'Användarnamnet eller e-posten är redan registrerad' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      console.log('❌ Password does not meet criteria');
      return res.status(400).json({ error: 'Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en siffra och ett specialtecken' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔹 Password hashed');

    const newUserData = { email, username, password: hashedPassword, role: userRole };
    if (userRole === 'deltagare' && personalNumber) newUserData.personalNumber = personalNumber;

    const newUser = await userModel.createUser(newUserData);
    console.log('✅ New user created:', newUser);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    console.log('🔹 JWT generated for new user:', token);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'None' : 'Lax',
      maxAge: 8 * 60 * 60 * 1000,
    });
    console.log('🔹 Token cookie set for new user, secure:', isProd);

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
