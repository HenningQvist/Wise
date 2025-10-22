const express = require('express'); // ✅ Lägg till detta
const cors = require('cors');
const passport = require('passport');

// Sanera URL
const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, '');
  req.originalUrl = req.originalUrl.replace(/%0A/g, '');
  next();
};

// Felhantering
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error Stack:', err.stack);
  res.status(500).json({
    message: 'Något gick fel!',
    error: process.env.NODE_ENV !== 'production' ? err.stack : err.message
  });
};

module.exports = (app) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS-förfrågan blockerad av servern.'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','POST','PUT','DELETE','OPTIONS']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(express.json());      // ✅ Behöver express importerad
  app.use(passport.initialize());
  app.use(sanitizeUrl);
  app.use(errorHandler);
};
