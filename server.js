// server.js
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

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('🌱 Miljövariabler laddade från .env');
}

// Kontrollera obligatoriska miljövariabler
const requiredVars = ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET', 'FRONTEND_URL'];
requiredVars.forEach(v => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// --- Viktigt för express-rate-limit bakom proxy (Railway, Netlify) ---
app.set('trust proxy', 1);

// Säkerhet & logg
app.use(helmet());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// --- CORS korrekt inställt ---
const allowedOrigins = [
  'http://localhost:3000',
  'https://wisemate.netlify.app'
];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, '').trim());

app.use(cors({
  origin: function(origin, callback) {
    const cleanedOrigin = origin?.replace(/\/$/, '').trim();
    console.log('🌐 Incoming request origin (cleaned):', cleanedOrigin);
    console.log('✅ Allowed origins:', allowedOrigins);

    if (!origin) {
      console.log('🟢 Request utan origin (Postman/server), tillåts');
      return callback(null, '*');
    }
    if (allowedOrigins.includes(cleanedOrigin)) {
      console.log('🟢 Origin tillåten:', cleanedOrigin);
      return callback(null, cleanedOrigin); // Viktigt: returnera origin, inte true
    }

    console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
    return callback(new Error(`CORS-förfrågan blockerad: ${origin}`));
  },
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

// För att hantera preflight
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

// JSON & cookies
app.use(express.json({
  verify: (req, res, buf) => { console.log('📦 Raw body:', buf.toString()); }
}));
app.use(cookieParser());

// Passport
require('./config/passport')(passport);
app.use(passport.initialize());

// Anpassad middleware
applyMiddleware(app);

// Statisk filhantering
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// Logga alla inkommande requests
app.use((req, res, next) => {
  console.log('--- Ny Request ---');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// --- API-routes ---
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// Test-endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ CORS fungerar!' });
});

// Global felhantering
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.stack || err);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// Starta server
const PORT = process.env.PORT || 5000;

// Lokal HTTPS (utveckling)
if (process.env.NODE_ENV !== 'production' && process.env.HTTPS === 'true') {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE || 'localhost-key.pem'),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE || 'localhost.pem')
  };
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🚀 HTTPS-server lokalt på https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => console.log(`🚀 Backend körs på port ${PORT}`));
}
