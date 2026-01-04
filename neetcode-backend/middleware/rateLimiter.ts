import rateLimit from 'express-rate-limit';
import { config } from '../config/index';

export const createRateLimiter = (windowMs?: number, max?: number) => {
  return rateLimit({
    windowMs: windowMs || config.rateLimit.windowMs,
    max: max || config.rateLimit.maxRequests,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const generalRateLimiter = createRateLimiter();

export const strictRateLimiter = createRateLimiter(60000, 10); // 1 minute, 10 requests

export const authRateLimiter = createRateLimiter(300000, 5); // 5 minutes, 5 requests
