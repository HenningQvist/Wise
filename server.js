const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet'); // Importera Helmet för säkerhet
const authRoutes = require('./routes/authRoutes'); // Auth-rutter
const applyMiddleware = require('./middlewares/middleware');
const protectedRoutes = require('./routes/protectedRoutes');
const fs = require('fs');
const https = require('https');
const cookieParser = require('cookie-parser');  // Importera cookie-parser
const path = require('path');

dotenv.config(); // Ladda miljövariabler

// Konfigurera Passport
require('./config/passport')(passport); // Passera Passport till konfigurationen

const app = express(); // Skapa Express-applikationen

// Använd Helmet för att säkerställa säkra HTTP-headers
app.use(helmet());  // Säkerställer en rad grundläggande säkerhetsheaders

// Logga varje inkommande förfrågan
app.use((req, res, next) => {
  console.log(`Inkommande förfrågan: ${req.method} ${req.url}`);
  next();
});

// Använd cookie-parser innan Passport
app.use(cookieParser());  // Lägg till cookie-parser här för att hantera cookies

// Använd Passport som middleware
app.use(passport.initialize()); // Initialisera Passport

// Middleware för loggning och hantering av CORS
const corsOptions = {
  origin: 'https://localhost:3000',  // Specificera den tillåtna origin
  credentials: true,  // Tillåt cookies (credentials)
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'] // Specifika headers som tillåts
};

// För att servera favicon
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));

// Middleware för loggning och CORS
app.use(morgan('dev'));
app.use(cors(corsOptions)); // Tillåt CORS med cookies
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Anpassad middleware
applyMiddleware(app); // Din anpassade middleware

// Auth-rutter
app.use('/api/auth', authRoutes); // Lägg till auth-rutterna på /api/auth

// Skyddade rutter
app.use('/api', protectedRoutes);  // Lägg till skyddade rutter

// Ladda certifikat och nyckel för HTTPS
const privateKey = fs.readFileSync('../localhost-key.pem', 'utf8'); 
const certificate = fs.readFileSync('../localhost.pem', 'utf8'); 
const credentials = { key: privateKey, cert: certificate };

// Felhantering för CORS-headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://localhost:3000"); // Viktigt att ange rätt origin
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  // Hantera OPTIONS-förfrågningar (för CORS preflight requests)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Starta HTTPS-servern
const PORT = process.env.PORT || 5000;
https.createServer(credentials, app).listen(PORT, () => {
  console.log(`🚀 Servern körs på https://localhost:${PORT}`);
});
