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

// ===== Ladda miljövariabler =====
dotenv.config();
console.log(`🌱 Miljövariabler laddade från .env eller .env.production`);

['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'].forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// Trust proxy för produktion
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// ===== Säkerhet & loggning =====
app.use(helmet());
app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined'));

// ===== JSON & cookies =====
app.use(express.json());
app.use(cookieParser());

// ===== Passport init =====
require('./config/passport')(passport); // Registrera JWT-strategin
app.use(passport.initialize());

// ===== CORS, sanitize, error-handling (din middleware) =====
const applyMiddleware = require('./middlewares/middleware');
applyMiddleware(app);

// ===== Statisk filhantering =====
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// ===== API-routes =====
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ===== Global felhantering =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// ===== Starta server =====
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  const httpsOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_FILE || 'localhost-key.pem'),
    cert: fs.readFileSync(process.env.SSL_CRT_FILE || 'localhost.pem')
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`🚀 HTTPS-servern kör lokalt på https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Servern kör i produktion på port ${PORT}`);
  });
}
