const cors = require('cors');
const express = require('express');
const passport = require('passport');

// Middleware-funktion för att sanera URL:er
const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, ''); // Ta bort radbrytningar
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
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
      return callback(new Error('CORS-förfrågan blockerad av servern.'));
    },
    credentials: true, // Viktigt för cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  };

  // ✅ Preflight före andra middleware
  app.options('*', cors(corsOptions));

  // ✅ CORS måste komma **före** body-parsing och Passport
  app.use(cors(corsOptions));

  // ✅ JSON-parsing
  app.use(express.json());

  // ✅ Passport
  app.use(passport.initialize());

  // ✅ URL-sanering
  app.use(sanitizeUrl);

  // ✅ Global felhantering **sist**
  app.use(errorHandler);
};
