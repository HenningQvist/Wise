const cors = require('cors');
const express = require('express');
const passport = require('passport');

// Middleware-funktion för att sanera URL:er
const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, ''); // Ta bort radbrytningar från URL
  req.originalUrl = req.originalUrl.replace(/%0A/g, '');
  next();
};

// Middleware för felhantering
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error Stack:', err.stack); // Mer detaljerad loggning
  res.status(500).json({ message: 'Något gick fel!', error: err.message });
};

// Exportera middleware
module.exports = (app) => {
  // Dynamisk CORS-konfiguration via miljövariabel eller default lokalt
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const corsOptions = {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true); // Postman eller server-till-server
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS-förfrågan blockerad av servern.'));
      }
    },
    credentials: true, // Tillåt användning av cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // Hantera preflight

  app.use(express.json());
  app.use(passport.initialize());
  app.use(sanitizeUrl);  // Sanera URL:er (kan kommenteras för felsökning)
  app.use(errorHandler); // Global felhantering
};
