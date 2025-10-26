const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const applyMiddleware = require('./middlewares/middleware');

// 🌱 Ladda .env i utveckling
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('🌱 Miljövariabler laddade från .env');
}

// ✅ Kontrollera att viktiga miljövariabler finns
const requiredVars = ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// ✅ Viktigt: aktivera proxy-läge FÖRE allt annat (Railway kräver detta för Secure cookies)
app.set('trust proxy', 1);

// ✅ Säkerhet & loggning
app.use(helmet());
app.use(process.env.NODE_ENV !== 'production' ? morgan('dev') : morgan('combined'));

// ✅ CORS-konfiguration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

console.log('🌍 Tillåtna origins:', allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🔹 CORS-förfrågan från origin:', origin);
    if (!origin) return callback(null, true); // tillåt t.ex. Postman
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS tillåten för:', origin);
      return callback(null, true);
    } else {
      console.warn('❌ Blockerad CORS-förfrågan från:', origin);
      return callback(new Error('CORS-förfrågan blockerad av servern.'));
    }
  },
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

// ✅ Hantera preflight med credentials
app.options('*', cors(corsOptions));

// ✅ JSON och cookies
app.use(express.json());
app.use(cookieParser());

// 🔍 Logga inkommande cookies (hjälper dig se varför token saknas)
app.use((req, res, next) => {
  console.log('🍪 Inkommande cookies:', req.cookies);
  next();
});

// ✅ Passport init
require('./config/passport')(passport);
app.use(passport.initialize());

// ✅ Anpassad middleware
applyMiddleware(app);

// ✅ Statisk filhantering
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'favicon.ico')));

// ✅ API-routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ✅ Global felhantering
app.use((err, req, res, next) => {
  console.error('⚠️ Globalt fel:', err.stack || err);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// ✅ Starta server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  // Lokalt HTTPS
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE || 'localhost-key.pem'),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE || 'localhost.pem'),
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🚀 HTTPS-servern körs lokalt på https://localhost:${PORT}`);
  });
} else {
  // Produktion (Railway hanterar HTTPS via proxy)
  app.listen(PORT, () => {
    console.log(`🚀 Servern körs i produktion på port ${PORT}`);
  });
}
