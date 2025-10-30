const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');
const passport = require('./config/passport');
const applyMiddleware = require('./middlewares/middleware');

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

dotenv.config();

const app = express();
app.use(helmet());
app.use(process.env.NODE_ENV !== 'production' ? morgan('dev') : morgan('combined'));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(require('cors')({
  origin: (origin, callback) => !origin || allowedOrigins.includes(origin) ? callback(null, true) : callback(new Error('CORS-förfrågan blockerad')),
  credentials: true,
  allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
applyMiddleware(app);

// Statisk
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Något gick fel!',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  const keyFile = process.env.SSL_KEY_FILE || 'localhost-key.pem';
  const crtFile = process.env.SSL_CRT_FILE || 'localhost.pem';
  if (fs.existsSync(keyFile) && fs.existsSync(crtFile)) {
    https.createServer({ key: fs.readFileSync(keyFile), cert: fs.readFileSync(crtFile) }, app)
      .listen(PORT, () => console.log(`🚀 HTTPS lokalt på https://localhost:${PORT}`));
  } else {
    app.listen(PORT, () => console.log(`🚀 HTTP lokalt på http://localhost:${PORT}`));
  }
} else {
  app.listen(PORT, () => console.log(`🚀 Server i produktion på port ${PORT}`));
}
