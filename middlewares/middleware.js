const cors = require('cors');
const express = require('express');
const passport = require('passport');

// Middleware för att sanera URL:er
const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, '');
  next();
};

// Global felhantering
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error Stack:', err.stack);
    res.status(500).json({ message: 'Något gick fel!', error: err.message });
  } else {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: 'Internt serverfel' });
  }
};

module.exports = (app) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
      return callback(new Error('CORS-förfrågan blockerad.'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  app.use(express.json());
  app.use(passport.initialize());
  app.use(sanitizeUrl);
  app.use(errorHandler);
};
