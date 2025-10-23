const { Strategy, ExtractJwt } = require('passport-jwt');
const pool = require('../config/database'); // Din PostgreSQL pool
const dotenv = require('dotenv');
dotenv.config();

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    req => req?.cookies?.token // ✅ Cookie-token
  ]),
  secretOrKey: process.env.JWT_SECRET,
  algorithms: ['HS256']
};

const jwtStrategy = new Strategy(options, async (jwtPayload, done) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.id]);
    if (rows.length > 0) return done(null, rows[0]);
    return done(null, false, { message: 'User not found' });
  } catch (err) {
    return done(err, false);
  }
});

module.exports = (passport) => passport.use('jwt', jwtStrategy);
