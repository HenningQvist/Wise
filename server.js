// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const applyMiddleware = require('./middlewares/middleware');

dotenv.config();

const requiredVars = ['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET', 'FRONTEND_URL'];
requiredVars.forEach(v => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();
app.set('trust proxy', 1); // Viktigt bakom proxy (Railway, Netlify)

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({
  verify: (req, res, buf) => console.log('📦 Raw body:', buf.toString())
}));
app.use(cookieParser());

// --- Dynamisk CORS ---
const frontendURL = process.env.FRONTEND_URL?.replace(/\/$/, '');
if (!frontendURL) {
  console.error('❌ FRONTEND_URL är inte satt! Kontrollera Railway miljövariabler.');
  process.exit(1); // stoppa servern så du inte kör med fel origin
}

console.log('🔧 FRONTEND_URL i runtime:', frontendURL);

const allowedOrigins = [frontendURL];
console.log('✅ Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Postman/server-to-server
    const cleanedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanedOrigin)) {
      console.log('🟢 CORS tillåten för:', cleanedOrigin);
      return callback(null, true);
    }
    console.warn('🚫 Blockerad CORS-förfrågan från:', origin);
    return callback(new Error('CORS-förfrågan blockerad av servern.'));
  },
  credentials: true,
  allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

// För preflight requests
app.options('*', cors({ origin: allowedOrigins, credentials: true }));



// Passport + middleware
require('./config/passport')(require('passport'));
app.use(require('passport').initialize());
applyMiddleware(app);

// Logga alla inkommande requests
app.use((req, res, next) => {
  console.log('--- Ny Request ---');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// API-routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// Test CORS
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
app.listen(PORT, () => console.log(`🚀 Backend körs på port ${PORT}`));
