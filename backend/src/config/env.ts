import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oslab';
const JWT_SECRET = process.env.JWT_SECRET || 'oslab_dev_secret_key_change_in_production_2024';

if (NODE_ENV === 'production') {
  if (!process.env.MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined in production environment.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here') {
    console.error('FATAL ERROR: A secure JWT_SECRET must be defined in production environment.');
    process.exit(1);
  }
}

export const env = {
  NODE_ENV,
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
};

