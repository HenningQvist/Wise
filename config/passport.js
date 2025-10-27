const { Strategy, ExtractJwt } = require('passport-jwt');
const pool = require('./database');
const dotenv = require('dotenv');

dotenv.config();

const options = {
  // 🔹 JWT hämtas från Authorization-header: "Bearer <token>"
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

const jwtStrategy = new Strategy(options, async (jwtPayload, done) => {
  try {
    console.log('🔹 Token payload:', jwtPayload);

    // Hämta användare från databasen med ID från JWT
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
    if (rows.length > 0) {
      console.log('✅ User found:', rows[0]);
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

// Exporterar Passport-strategin
module.exports = (passport) => {
  passport.use('jwt', jwtStrategy);
};
