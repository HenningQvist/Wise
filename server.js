const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const applyMiddleware = require('./middlewares/middleware');
const protectedRoutes = require('./routes/protectedRoutes');
const fs = require('fs');
const https = require('https');
const http = require('http');
const cookieParser = require('cookie-parser');
const path = require('path');

// Ladda .env ENDAST i utveckling
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
  console.log('🌱 Miljövariabler laddade från .env');
}

// Kontrollera obligatoriska miljövariabler
const requiredVars = ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET', 'PORT'];
requiredVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// Middleware för säkerhet och loggning
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Dynamisk origin
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Passport
require('./config/passport')(passport);
app.use(passport.initialize());

// Anpassad middleware
applyMiddleware(app);

// Statisk filhantering
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// HTTPS / HTTP fallback
const PORT = process.env.PORT || 5000;

if (process.env.HTTPS === 'true') {
  try {
    const privateKey = fs.readFileSync(process.env.SSL_KEY_FILE, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CRT_FILE, 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    https.createServer(credentials, app).listen(PORT, () => {
      console.log(`🚀 HTTPS-servern körs på port ${PORT}`);
    });
  } catch (err) {
    console.warn('⚠️ HTTPS-certifikat kunde inte läsas, fallback till HTTP');
    http.createServer(app).listen(PORT, () => {
      console.log(`🚀 HTTP-servern körs på port ${PORT}`);
    });
  }
} else {
  http.createServer(app).listen(PORT, () => {
    console.log(`🚀 HTTP-servern körs på port ${PORT}`);
  });
}

// Extra CORS-hantering för OPTIONS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
