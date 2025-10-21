const cors = require('cors');
const express = require('express');
const passport = require('passport');

const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, '');
  req.originalUrl = req.originalUrl.replace(/%0A/g, '');
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({ message: 'Något gick fel!', error: err.message });
};

module.exports = (app) => {
  const allowedOrigins = [];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
  }

  console.log('🌍 applyMiddleware CORS allowed origins:', allowedOrigins);

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanedOrigin)) {
        console.log('🟢 Middleware tillåter:', cleanedOrigin);
        return callback(null, true);
      }
      console.warn('🚫 Middleware blockerade:', origin);
      return callback(new Error('CORS-förfrågan blockerad av middleware.'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(passport.initialize());
  app.use(sanitizeUrl);
  app.use(errorHandler);
};
