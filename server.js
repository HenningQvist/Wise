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

// =======================
// Miljövariabler
// =======================
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.join(__dirname, envFile);

if (!fs.existsSync(envPath)) {
  console.error(`❌ Kunde inte hitta miljöfil: ${envFile}`);
  process.exit(1);
}

dotenv.config({ path: envPath });
console.log(`✅ Miljövariabler laddade från: ${envFile}`);

// Kontrollera obligatoriska variabler
['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'].forEach(v => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// =======================
// Trust proxy i produktion
// =======================
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// =======================
// Säkerhet och logg
// =======================
app.use(helmet());
app.use(process.env.NODE_ENV !== 'production' ? morgan('dev') : morgan('combined'));

// =======================
// CORS
// =======================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS-förfrågan blockerad av servern.'));
  },
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.options('*', cors({ origin: allowedOrigins, credentials: true }));

// =======================
// JSON, cookies, Passport
// =======================
app.use(express.json());
app.use(cookieParser());
require('./config/passport')(passport);
app.use(passport.initialize());

// =======================
// Anpassad middleware & statiska filer
// =======================
const applyMiddleware = require('./middlewares/middleware');
applyMiddleware(app);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// =======================
// API-routes
// =======================
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// =======================
// Global felhantering
// =======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// =======================
// Starta server
// =======================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE || 'localhost-key.pem'),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE || 'localhost.pem')
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🚀 HTTPS-servern körs lokalt på https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Servern körs i produktion på port ${PORT}`);
    console.log(`🌍 Tillåtna origins: ${allowedOrigins.join(', ')}`);
  });
}
