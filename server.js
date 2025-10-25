const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const applyMiddleware = require('./middlewares/middleware');

// Ladda .env lokalt
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('🌱 Miljövariabler laddade från .env');
}

// Kontrollera obligatoriska miljövariabler
const requiredVars = ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// ✅ Trust proxy i produktion (viktigt för cookies)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ✅ Grundläggande säkerhet
app.use(helmet());

// ✅ Logging
app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined'));

// ✅ Cookie parser (måste komma före Passport)
app.use(cookieParser());

// ✅ Passport-konfiguration
require('./config/passport')(passport);
app.use(passport.initialize());

// ✅ Global middleware: CORS, URL-sanitizing, JSON
applyMiddleware(app);
app.use(express.json());

// ✅ Statisk filhantering
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// ✅ API-rutter
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ✅ Test /protected rutt med loggar
app.get('/api/protected-test', passport.authenticate('jwt', { session: false }), (req, res) => {
  console.log('🔹 /protected-test accessed');
  console.log('🔹 Cookies i request:', req.cookies);
  if (!req.user) return res.status(401).json({ message: 'Ej auktoriserad' });
  res.json({
    message: 'JWT funkar! Här är användardata:',
    user: req.user
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err.stack);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// ✅ Starta server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  // Lokal HTTPS för cookies
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
  });
}
