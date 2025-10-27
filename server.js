const express = require('express');
const dotenv = require('dotenv');
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

// 🔹 Ladda .env i utveckling
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('🌱 Miljövariabler laddade från .env');
}

// 🔹 Kontrollera obligatoriska miljövariabler
const requiredVars = ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// ✅ Trust proxy i produktion (om du kör bakom Railway reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ✅ Säkerhet & logg
app.use(helmet());
app.use(process.env.NODE_ENV !== 'production' ? morgan('dev') : morgan('combined'));

// ✅ Dynamisk CORS-konfiguration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS-förfrågan blockerad av servern.'));
  },
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight

// ✅ JSON & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Anpassad middleware
applyMiddleware(app);

// ✅ Statisk filhantering
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// ✅ API-routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ✅ Global felhantering
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// ✅ Starta server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  // Lokalt HTTPS med fallback om certifikat saknas
  const keyFile = process.env.SSL_KEY_FILE || 'localhost-key.pem';
  const crtFile = process.env.SSL_CRT_FILE || 'localhost.pem';

  if (fs.existsSync(keyFile) && fs.existsSync(crtFile)) {
    const httpsOptions = {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(crtFile)
    };
    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`🚀 HTTPS-servern kör lokalt på https://localhost:${PORT}`);
    });
  } else {
    console.warn('⚠️ Lokala SSL-filer saknas, startar HTTP istället');
    app.listen(PORT, () => {
      console.log(`🚀 HTTP-servern kör lokalt på http://localhost:${PORT}`);
    });
  }
} else {
  // Produktion (Railway hanterar HTTPS via proxy)
  app.listen(PORT, () => {
    console.log(`🚀 Servern körs i produktion på port ${PORT}`);
  });
}
