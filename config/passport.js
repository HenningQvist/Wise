// config/passport.js
const { Strategy: JwtStrategy } = require('passport-jwt');
const pool = require('./database');

const cookieExtractor = (req) => {
  if (req && req.cookies) {
    return req.cookies.token || req.cookies.jwt || null;
  }
  return null;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256'],
};

module.exports = (passport) => {
  passport.use('jwt', new JwtStrategy(options, async (jwtPayload, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
      if (rows.length > 0) return done(null, rows[0]);
      return done(null, false, { message: 'User not found' });
    } catch (err) {
      return done(err, false);
    }
  }));
};
