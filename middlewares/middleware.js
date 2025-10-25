// middlewares/middleware.js
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');

module.exports = (app) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  console.log('🌍 Tillåtna origins:', allowedOrigins);

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman/server requests
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS-förfrågan blockerad'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // Preflight
  app.use(cookieParser());
  app.use(express.json());
  app.use(passport.initialize());
};
