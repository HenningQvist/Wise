const cors = require('cors');

// Middleware-funktion för att sanera URL:er
const sanitizeUrl = (req, res, next) => {
  req.url = req.url.replace(/%0A/g, '');
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

module.exports = (app) => {
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
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman/server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
      return callback(new Error('CORS-förfrågan blockerad av servern.'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET','POST','PUT','DELETE','OPTIONS']
  };

  // Preflight
  app.options('*', cors(corsOptions));
  // CORS
  app.use(cors(corsOptions));
  // URL-sanering
  app.use(sanitizeUrl);
  // Global felhantering sist
  app.use(errorHandler);
};
