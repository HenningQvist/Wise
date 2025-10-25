const cors = require('cors');
const express = require('express');
const passport = require('passport');
const cookieParser = require('cookie-parser'); // ✅ Nödvändig för att Passport ska hitta JWT i cookies

// 🧹 Sanera URL:er
const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, '');
  next();
};

// 🧩 CORS & global middleware
module.exports = (app) => {
  // Hämta tillåtna origins från miljö
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
    origin: function (origin, callback) {
      // Tillåt preflight/förfrågningar utan origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
        return callback(null, false); // Blockera men returnera ej error (viktigt för cookies)
      }
    },
    credentials: true, // ✅ Viktigt för cookies
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  };

  // 🧩 Middleware i rätt ordning
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions)); // Preflight
  app.use(cookieParser());             // ✅ Måste komma FÖRE Passport
  app.use(express.json());
  app.use(passport.initialize());
  app.use(sanitizeUrl);
};
