const { Strategy, ExtractJwt } = require('passport-jwt');
const pool = require('./database');
const dotenv = require('dotenv');

dotenv.config();

// 🔹 Extraktor för JWT från cookie
const cookieExtractor = (req) => {
  if (!req || !req.cookies) {
    console.log('⚠️ Ingen cookie-parser aktiverad eller inga cookies i request');
    return null;
  }
  console.log('🔹 Alla cookies i request:', req.cookies);
  const token = req.cookies.token;
  if (!token) {
    console.log('⚠️ Ingen token hittades i cookies');
  }
  return token || null;
};

// Passport JWT options
const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

// 🔐 JWT-strategi
const jwtStrategy = new Strategy(options, async (jwtPayload, done) => {
  try {
    if (!jwtPayload) {
      console.log('⚠️ Ingen JWT-payload mottagen');
      return done(null, false);
    }

    console.log('🔹 Token extraherad från cookies, payload:', jwtPayload);

    // Hämta användare från databasen
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
    console.log('🔹 Resultat från DB query:', rows);

    if (rows.length > 0) {
      console.log('✅ User found in DB:', rows[0]);
      return done(null, rows[0]);
    } else {
      console.log('❌ User not found with ID:', jwtPayload.id);
      return done(null, false, { message: 'User not found' });
    }
  } catch (err) {
    console.error('⚠️ Error querying the database:', err);
    return done(err, false);
  }
});

// Exportera Passport-strategin
module.exports = (passport) => {
  passport.use('jwt', jwtStrategy);
};
