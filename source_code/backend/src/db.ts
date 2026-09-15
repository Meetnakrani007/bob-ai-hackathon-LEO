import mongoose from 'mongoose';
import { logger } from './utils/logger';

let isConnected = false;

export async function connectDB(uri?: string): Promise<typeof mongoose> {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/supplyguard';
  
  if (isConnected) {
    return mongoose;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  }
}
