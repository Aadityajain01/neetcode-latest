import mongoose from 'mongoose';
import { config } from '../config/index';
import { logger } from '../logger/index';
import dotenv from 'dotenv';

dotenv.config();
export class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connectMongo(): Promise<void> {
    try {
      console.log(config.mongodb.uri);
      
      await mongoose.connect(config.mongodb.uri, {
        dbName: config.mongodb.database,
      });
      logger.info('MongoDB connected successfully');

      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  public async disconnectMongo(): Promise<void> {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB disconnected');
    } catch (error) {
      logger.error('MongoDB disconnection failed:', error);
      throw error;
    }
  }
}

export const database = Database.getInstance();
