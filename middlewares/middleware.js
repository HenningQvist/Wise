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
  console.error('Error Stack:', err.stack); // Mer detaljerad loggning
  res.status(500).json({ message: 'Något gick fel!', error: err.message });
};

// Exportera middleware
module.exports = (app) => {
  // CORS-konfiguration för att hantera credentials
  const corsOptions = {
    origin: 'https://localhost:3000',  // Exakt ursprung
    credentials: true,  // Tillåt användning av cookies
    allowedHeaders: ['Content-Type', 'Authorization'],  // Tillåt headers som Authorization och Content-Type
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // De HTTP-metoder som är tillåtna
  };

  app.use(cors(corsOptions));  // Uppdaterad CORS-konfiguration
  app.use(express.json());
  app.use(passport.initialize());
  app.use(sanitizeUrl);  // Sanera URL:er (kan kommenteras för felsökning)
  app.use(errorHandler);  // Felhantering
};
