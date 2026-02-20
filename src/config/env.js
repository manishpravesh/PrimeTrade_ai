const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  mongoUri: process.env.MONGODB_URI,
  defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@primetrade.ai',
  defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@12345'
};
