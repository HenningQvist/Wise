const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Välj fil baserat på NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.join(__dirname, '..', envFile);

// Kontrollera att filen finns
if (!fs.existsSync(envPath)) {
  console.error(`❌ Kunde inte hitta miljöfil: ${envFile}`);
  process.exit(1);
}

// Ladda miljövariabler
dotenv.config({ path: envPath });
console.log(`✅ Miljövariabler laddade från: ${envFile}`);

// Validera obligatoriska variabler
['DB_USER', 'DB_PASS', 'DB_HOST', 'DB_NAME', 'JWT_SECRET'].forEach(key => {
  if (!process.env[key]) {
    console.error(`❌ Miljövariabel saknas: ${key}`);
    process.exit(1);
  }
});

// Logga de viktigaste variablerna (maskera lösenord)
console.log({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
  JWT_SECRET: process.env.JWT_SECRET ? '********' : undefined,
  FRONTEND_URL: process.env.FRONTEND_URL,
  VITE_API_URL: process.env.VITE_API_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
});

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 5000,
  HTTPS: process.env.HTTPS === 'true',
  SSL_CRT_FILE: process.env.SSL_CRT_FILE,
  SSL_KEY_FILE: process.env.SSL_KEY_FILE,
  VITE_API_URL: process.env.VITE_API_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  JWT_SECRET: process.env.JWT_SECRET,
};
