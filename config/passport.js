// config/passport.js
const { Strategy, ExtractJwt } = require('passport-jwt');
const pool = require('./database');
const dotenv = require('dotenv');

dotenv.config();

/**
 * 🧩 Dynamisk token-extraktor beroende på AUTH_MODE
 */
const cookieExtractor = (req) => {
  if (!req || !req.cookies) {
    console.log('⚠️ Ingen cookie-parser aktiverad eller inga cookies i request');
    return null;
  }
  const token = req.cookies.token;
  if (!token) console.log('⚠️ Ingen JWT-token hittades i cookies');
  else console.log('🍪 JWT-token hittad i cookie');
  return token || null;
};

/**
 * 🔹 Kombinerad extraktor: cookie + Authorization-header
 */
const dynamicExtractor = (req) => {
  const mode = process.env.AUTH_MODE || 'cookie';

  // Först: cookie-läge
  if (mode === 'cookie') {
    const token = cookieExtractor(req);
    if (token) return token;
  }

  // Alternativt: Authorization header-läge
  const authHeader = req?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    console.log('📦 JWT-token hittad i Authorization-header');
    return authHeader.split(' ')[1];
  }

  console.log('🚫 Ingen token hittades i cookie eller header');
  return null;
};

/**
 * 🔐 JWT-konfiguration
 */
const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([dynamicExtractor]),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  ignoreExpiration: false,
};

/**
 * 🧠 JWT-strategi
 */
const jwtStrategy = new Strategy(options, async (jwtPayload, done) => {
  try {
    if (!jwtPayload) {
      console.warn('⚠️ Ingen JWT-payload mottagen');
      return done(null, false);
    }

    console.log('🔹 JWT payload mottagen:', jwtPayload);

    const { rows } = await pool.query(
      'SELECT id, username, email, role, admin, participant_id FROM users WHERE id = $1',
      [jwtPayload.id]
    );

    if (rows.length === 0) {
      console.warn('❌ Ingen användare hittades för ID:', jwtPayload.id);
      return done(null, false, { message: 'Användare hittades inte' });
    }

    const user = rows[0];
    console.log(`✅ Autentiserad användare: ${user.username} (roll: ${user.role})`);

    return done(null, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      admin: user.admin,
      participant_id: user.participant_id,
    });

  } catch (err) {
    console.error('💥 Fel vid JWT-verifiering eller databasfråga:', err);
    return done(err, false);
  }
});

/**
 * 🚀 Exportera strategin
 */
module.exports = (passport) => {
  passport.use('jwt', jwtStrategy);

  // Endast för felsökning / framtida sessioner
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await pool.query(
        'SELECT id, username, role, admin FROM users WHERE id = $1',
        [id]
      );
      done(null, rows[0]);
    } catch (err) {
      done(err, null);
    }
  });
};
