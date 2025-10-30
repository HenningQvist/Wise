const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const pool = require('./database'); // PostgreSQL pool
require('dotenv').config();

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

const jwtStrategy = new JwtStrategy(options, async (jwtPayload, done) => {
  try {
    console.log('🔹 JWT Payload:', jwtPayload); // Visa payload från token

    // Kolla att token faktiskt skickas
    // (ExtractJwt.fromAuthHeaderAsBearerToken() tar token från Authorization-header)
    const tokenFromHeader = options.jwtFromRequest({ headers: {} }); // Testa med mock headers om behövs
    console.log('🔹 Token från header (för test):', tokenFromHeader);

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
    if (rows.length > 0) {
      console.log('✅ User hittad i DB:', rows[0].username);
      return done(null, rows[0]);
    }

    console.warn('⚠️ User not found i DB');
    return done(null, false, { message: 'User not found' });
  } catch (err) {
    console.error('❌ Fel i JWT-strategi:', err);
    return done(err, false);
  }
});

passport.use('jwt', jwtStrategy);

module.exports = passport;
