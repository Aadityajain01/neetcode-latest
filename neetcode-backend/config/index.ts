
import dotenv from 'dotenv';

dotenv.config();
export const config = {
  port: parseInt(process.env.PORT , 10),
  nodeEnv: process.env.NODE_ENV ,

  mongodb: {
    uri: process.env.MONGODB_URI,
  },

  redis: {
    host: process.env.REDIS_HOST ,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD ,
    db: parseInt(process.env.REDIS_DB, 10),
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID ,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL ,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ,
  },

  judge0: {
    apiUrl: process.env.JUDGE0_API_URL || 'https://ce.judge0.com',
    apiKey: process.env.JUDGE0_API_KEY || '',
    pollingInterval: parseInt(process.env.JUDGE0_POLLING_INTERVAL , 10),
    maxPollingAttempts: parseInt(process.env.JUDGE0_MAX_POLLING_ATTEMPTS , 10),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ,10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS , 10),
  },

  cors: {
    origin: "*",
  },
};
