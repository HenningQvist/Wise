const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const https = require('https');
const path = require('path');

const passport = require('./config/passport');
const applyMiddleware = require('./middlewares/middleware');
const routes = require('./routes/protectedRoutes'); // alla API-rutter

dotenv.config();
const app = express();

app.use(helmet());
app.use(process.env.NODE_ENV !== 'production' ? morgan('dev') : morgan('combined'));

// Kör custom middleware: CORS, json-parser, passport
applyMiddleware(app);

// Statisk
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// Routes – **måste komma efter passport + json**
app.use('/api', routes);

// 404-hantering
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

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
