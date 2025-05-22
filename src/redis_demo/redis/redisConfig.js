import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

class RedisClient {
  constructor() {
    this.client = null;
  }

  connect() {
    if (!this.client) {
      this.client = new Redis(redisConfig);
      
      this.client.on('error', (error) => {
        console.error('Redis connection error:', error);
      });

      this.client.on('connect', () => {
        console.log('Successfully connected to Redis');
      });
    }
    return this.client;
  }

  getClient() {
    if (!this.client) {
      return this.connect();
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

export const redisClient = new RedisClient(); 