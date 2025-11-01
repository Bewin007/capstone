require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wealthwise',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  categorizationServiceUrl: process.env.CATEGORIZATION_SERVICE_URL || 'http://localhost:5001/api',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
};

module.exports = config;
