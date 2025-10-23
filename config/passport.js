const { Strategy: JwtStrategy } = require('passport-jwt');
const pool = require('./database');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // ✅ Behåll om cookies används
dotenv.config();

// 🧩 1. Cookie extractor-funktion
const cookieExtractor = (req) => {
  if (req && req.cookies) {
    console.log('🔹 Alla cookies i request:', req.cookies);
    const token = req.cookies.jwt || req.cookies.token; // ✅ stöd både 'jwt' och 'token'
    if (!token) {
      console.log('⚠️ Ingen JWT hittades i cookies');
    } else {
      console.log('✅ JWT hittades i cookie');
    }
    return token;
  }
  console.log('⚠️ Ingen req.cookies hittades (cookie-parser används kanske inte)');
  return null;
};

// 🧩 2. Strategy options
const options = {
  jwtFromRequest: cookieExtractor, // ✅ använd vår cookieExtractor
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

// 🧩 3. JWT-strategi
const jwtStrategy = new JwtStrategy(options, async (jwtPayload, done) => {
  try {
    console.log('🔹 Payload från JWT:', jwtPayload);

    // Kontrollera att payload innehåller id
    if (!jwtPayload.id) {
      console.log('❌ JWT saknar id-fält');
      return done(null, false, { message: 'Ogiltig token: saknar användar-ID' });
    }

    // 🔍 Hämta användare från databasen
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
    console.log('🔹 Resultat från DB query:', rows);

    if (rows.length > 0) {
      console.log('✅ Användare hittad:', rows[0].username || rows[0].email);
      return done(null, rows[0]);
    } else {
      console.log('❌ Ingen användare hittades med ID:', jwtPayload.id);
      return done(null, false, { message: 'User not found' });
    }
  } catch (err) {
    console.error('⚠️ Fel vid DB-sökning:', err);
    return done(err, false);
  }
});

// 🧩 4. Exportera som modul
module.exports = (passport) => {
  passport.use('jwt', jwtStrategy);
};
