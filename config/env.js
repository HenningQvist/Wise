const dotenv = require('dotenv');
const path = require('path');

// 🌍 Ladda .env *endast* lokalt (inte på Railway)
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../../.env') });
  console.log('🌱 Lokala miljövariabler laddade');
}

// ✅ Exportera miljövariabler
module.exports = {
  PORT: process.env.PORT || 5000,
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PASS: process.env.DB_PASS,
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL, // 👈 superviktig!
};
