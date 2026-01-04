import { createClient, RedisClientType } from 'redis';
import { config } from '../config/index';
import { logger } from '../logger/index';
import dotenv from 'dotenv';

dotenv.config();
export class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType | null = null;

  private constructor() {}

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        password: config.redis.password || undefined,
        database: config.redis.db,
      });

      this.client.on('error', (error) => {
        logger.error('Redis Client Error:', error);
      });

      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis disconnected');
      });

      this.client.on('reconnect', () => {
        logger.info('Redis reconnected');
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        logger.info('Redis disconnected');
      }
    } catch (error) {
      logger.error('Redis disconnection failed:', error);
      throw error;
    }
  }

  public getClient(): RedisClientType {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    return this.client;
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    const client = this.getClient();
    if (ttl) {
      await client.setEx(key, ttl, value);
    } else {
      await client.set(key, value);
    }
  }

  public async get(key: string): Promise<string | null> {
    const client = this.getClient();
    return await client.get(key);
  }

  public async del(key: string): Promise<void> {
    const client = this.getClient();
    await client.del(key);
  }

  public async zAdd(key: string, score: number, member: string): Promise<void> {
    const client = this.getClient();
    await client.zAdd(key, { score, value: member });
  }

  public async zRangeByScoreWithScores(
    key: string,
    min: number,
    max: number,
    limit?: { offset: number; count: number }
  ): Promise<Array<{ value: string; score: number }>> {
    const client = this.getClient();
    return await client.zRangeByScoreWithScores(
      key,
      min,
      max,
      limit ? { LIMIT: { offset: limit.offset, count: limit.count } } : undefined
    );
  }

  public async zRank(key: string, member: string): Promise<number | null> {
    const client = this.getClient();
    return await client.zRank(key, member);
  }

  public async zScore(key: string, member: string): Promise<number | null> {
    const client = this.getClient();
    return await client.zScore(key, member);
  }

  public async zRevRangeWithScores(
    key: string,
    start: number,
    stop: number
  ): Promise<Array<{ value: string; score: number }>> {
    const client = this.getClient();
    return await client.zRangeWithScores(key, start, stop, { REV: true });
  }
}

export const redisClient = RedisClient.getInstance();
