const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

// ===== Miljövariabler =====
dotenv.config();
['DB_USER','DB_PASS','DB_HOST','DB_NAME','JWT_SECRET'].forEach(v => {
  if (!process.env[v]) {
    console.error(`❌ Saknad miljövariabel: ${v}`);
    process.exit(1);
  }
});

const app = express();

// ===== Säkerhet och logg =====
app.use(helmet());
app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined'));
app.use(express.json());
app.use(cookieParser());

// ===== Passport JWT =====
require('./config/passport')(passport);
app.use(passport.initialize());

// ===== CORS =====
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // Postman/server
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS-blocked'));
  },
  credentials: true
}));

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// ===== Global felhantering =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Något gick fel!' });
});

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
