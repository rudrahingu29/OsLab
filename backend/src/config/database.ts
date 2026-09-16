import mongoose from 'mongoose';
import { env } from './env';

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const getDbState = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error event:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected');
    });

    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    console.error('Failed to connect to MongoDB at startup:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('MongoDB connection closed cleanly');
  }
};

