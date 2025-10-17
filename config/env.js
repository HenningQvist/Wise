const dotenv = require('dotenv');
const path = require('path');

// Ladda miljövariabler från två mappar upp
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Exportera miljövariabler med fallback-värden
module.exports = {
  PORT: process.env.PORT || 5000,
  DB_USER: process.env.DB_USER || 'default_user',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_NAME: process.env.DB_NAME || 'default_db',
  DB_PASS: process.env.DB_PASS || 'password',
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
};
