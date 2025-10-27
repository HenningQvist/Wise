// middlewares/middleware.js
const cors = require('cors');
const express = require('express');
const passport = require('passport');

// Middleware-funktion för att sanera URL:er
const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, '');          // Ta bort radbrytningar
  // OBS: originalUrl modifieras inte för säkerhet
  next();
};

// Middleware för felhantering
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error Stack:', err.stack);
    res.status(500).json({ message: 'Något gick fel!', error: err.message });
  } else {
    console.error('❌ Error:', err.message);
    res.status(500).json({ message: 'Internt serverfel' });
  }
};

// Exportera middleware
module.exports = (app) => {
  // Dynamisk CORS-konfiguration
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    console.warn('⚠️ Ingen ALLOWED_ORIGINS satt! CORS kan blockera alla förfrågningar.');
  } else {
    console.log('🌍 Tillåtna origins:', allowedOrigins.join(', '));
  }

  const corsOptions = {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true); // Postman eller server-till-server
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
        return callback(new Error('CORS-förfrågan blockerad av servern.'));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));  // Preflight

  app.use(express.json());
  app.use(passport.initialize());
  app.use(sanitizeUrl);  // Sanera URL:er
  app.use(errorHandler); // Global felhantering
};
