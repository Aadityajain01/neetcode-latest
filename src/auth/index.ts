import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/index';
import { database } from './utils/database';
import { redisClient } from './utils/redis';
import { initializeFirebase } from './middleware/auth';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimiter';
import { logger } from './logger/index';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import communityRoutes from './routes/communities';
import problemRoutes from './routes/problems';
import mcqRoutes from './routes/mcqs';
import submissionRoutes from './routes/submissions';
import executeRoutes from './routes/execute';
import leaderboardRoutes from './routes/leaderboard';
import adminRoutes from './routes/admin';

const app = express();

async function startServer() {
  try {
    await database.connectMongo();
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  try {
    await redisClient.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    process.exit(1);
  }

  try {
    initializeFirebase();
    logger.info('Firebase initialized');
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    process.exit(1);
  }

  app.use(helmet());

  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  app.use(compression());

  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(generalRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  app.get('/', (_req, res) => {
    res.json({
      name: 'NeetCode Backend API',
      version: '1.0.0',
      description: 'Competitive Coding Platform Backend',
      endpoints: {
        auth: '/auth',
        users: '/users',
        communities: '/communities',
        problems: '/problems',
        mcqs: '/mcqs',
        submissions: '/submissions',
        execute: '/execute',
        leaderboard: '/leaderboard',
        admin: '/admin',
      },
      health: '/health',
    });
  });

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/communities', communityRoutes);
  app.use('/problems', problemRoutes);
  app.use('/mcqs', mcqRoutes);
  app.use('/submissions', submissionRoutes);
  app.use('/execute', executeRoutes);
  app.use('/leaderboard', leaderboardRoutes);
  app.use('/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = config.port;

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`CORS origin: ${config.cors.origin}`);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await database.disconnectMongo();
    await redisClient.disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await database.disconnectMongo();
    await redisClient.disconnect();
    process.exit(0);
  });
}

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
