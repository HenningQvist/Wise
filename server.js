const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const applyMiddleware = require('./middlewares/middleware');
const protectedRoutes = require('./routes/protectedRoutes');
const cookieParser = require('cookie-parser');
const path = require('path');

// Ladda .env endast i utveckling (Railway använder miljövariabler direkt)
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

// ✅ Säkerhets- och logg-middleware
app.use(helmet());
app.use(morgan('dev'));

// ✅ CORS – tillåt frontend från Railway/Vercel
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://wisemate.netlify.app/",     
    "https://din-frontend-production.up.railway.app"
  ],
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Passport init
require('./config/passport')(passport);
app.use(passport.initialize());

// ✅ Anpassad middleware
applyMiddleware(app);

// ✅ Statisk filhantering
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ✅ Hantera CORS preflight
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ✅ Starta servern (Railway använder sin egen HTTPS proxy)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servern körs i ${process.env.NODE_ENV || 'utveckling'}-läge på port ${PORT}`);
});
