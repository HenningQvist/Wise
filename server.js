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

// 🌱 Ladda .env i utveckling
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('🌱 Miljövariabler laddade från .env');
}

// ✅ Kontrollera obligatoriska miljövariabler
const requiredVars = ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET', 'FRONTEND_URL'];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// 🖇️ Trust proxy (viktigt för express-rate-limit och cookies bakom proxy)
app.set('trust proxy', 1); // 1 = första proxy (t.ex. Railway/Netlify)

// ✅ Säkerhet & logg
app.use(helmet());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ✅ CORS-konfiguration
const allowedOrigins = [
  'http://localhost:3000',
  'https://wisemate.netlify.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 Incoming request origin:', origin);
    if (!origin) return callback(null, true); // Postman/server-till-server
    const cleanedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanedOrigin)) return callback(null, true);
    console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
    return callback(new Error('CORS-förfrågan blockerad av servern.'));
  },
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Preflight OPTIONS
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ JSON & cookies
app.use(express.json({
  verify: (req, res, buf) => {
    console.log('📦 Raw body:', buf.toString());
  }
}));
app.use(cookieParser());

// ✅ Passport init
require('./config/passport')(passport);
app.use(passport.initialize());

// ✅ Anpassad middleware
applyMiddleware(app);

// ✅ Statisk filhantering
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// ✅ Logga ALLA inkommande requests
app.use((req, res, next) => {
  console.log('--- Ny Request ---');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// ✅ API-routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ✅ Test-endpoint (för att kolla CORS från frontend)
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ CORS fungerar!' });
});

// ✅ Global felhantering
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err.stack);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// ✅ Starta server
const PORT = process.env.PORT || 5000;

// 🌟 Lokal utveckling med HTTPS
if (process.env.NODE_ENV !== 'production' && process.env.HTTPS === 'true') {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE || 'localhost-key.pem'),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE || 'localhost.pem')
  };
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🚀 HTTPS-server lokalt på https://localhost:${PORT}`);
  });
} else {
  // 🌟 Produktion (Railway hanterar HTTPS)
  app.listen(PORT, () => {
    console.log(`🚀 Backend körs på port ${PORT}`);
  });
}
