// config/passport.js
const { Strategy, ExtractJwt } = require('passport-jwt');
const pool = require('./database');
const dotenv = require('dotenv');

dotenv.config();

/**
 * 🔹 Hämtar JWT-token från cookies
 */
const cookieExtractor = (req) => {
  if (!req || !req.cookies) {
    console.log('⚠️ Ingen cookie-parser aktiverad eller inga cookies i request');
    return null;
  }

  const token = req.cookies.token;
  if (!token) {
    console.log('⚠️ Ingen JWT-token hittades i cookies');
    return null;
  }

  console.log('🍪 Cookie hittad → token existerar');
  return token;
};

/**
 * 🔐 JWT-konfig
 */
const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  ignoreExpiration: false, // extra säkerhet
};

/**
 * 🧩 JWT-strategi
 */
const jwtStrategy = new Strategy(options, async (jwtPayload, done) => {
  try {
    if (!jwtPayload) {
      console.log('⚠️ Ingen JWT-payload mottagen');
      return done(null, false);
    }

    console.log('🔹 JWT payload mottagen:', jwtPayload);

    // 🔍 Hämta användaren från databasen
    const { rows } = await pool.query('SELECT id, username, email, role, admin, participant_id FROM users WHERE id = $1', [jwtPayload.id]);

    if (rows.length === 0) {
      console.warn('❌ Ingen användare hittades för ID:', jwtPayload.id);
      return done(null, false, { message: 'Användare hittades inte' });
    }

    const user = rows[0];
    console.log('✅ Autentiserad användare:', user.username, '| Roll:', user.role);

    // 🧹 Ta inte med lösenord eller känsliga fält
    return done(null, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      admin: user.admin,
      participant_id: user.participant_id,
    });

  } catch (err) {
    console.error('💥 Fel vid JWT-verifiering eller DB-query:', err);
    return done(err, false);
  }
});

/**
 * 🧠 Exportera och aktivera strategin i Passport
 */
module.exports = (passport) => {
  passport.use('jwt', jwtStrategy);

  // Valfritt: enkel serialize/deserialize (för debug eller hybrid-sessioner)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query('SELECT id, username, role, admin FROM users WHERE id = $1', [id]);
      done(null, rows[0]);
    } catch (err) {
      done(err, null);
    }
  });
};
