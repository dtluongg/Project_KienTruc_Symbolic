import { redisClient } from './redis/redisConfig.js';

class RedisRepository {
  constructor() {
    this.client = redisClient.getClient();
  }

  // Create or Update
  async set(key, value, expireTime = 3600) {
    try {
      const stringValue = JSON.stringify(value);
      if (expireTime) {
        await this.client.setex(key, expireTime, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  // Read
  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      throw error;
    }
  }

  // Delete
  async delete(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      throw error;
    }
  }

  // Check if key exists
  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      console.error('Redis exists error:', error);
      throw error;
    }
  }

  // Set with hash
  async hset(hash, key, value) {
    try {
      const stringValue = JSON.stringify(value);
      await this.client.hset(hash, key, stringValue);
      return true;
    } catch (error) {
      console.error('Redis hset error:', error);
      throw error;
    }
  }

  // Get from hash
  async hget(hash, key) {
    try {
      const value = await this.client.hget(hash, key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis hget error:', error);
      throw error;
    }
  }

  // Get all from hash
  async hgetall(hash) {
    try {
      const values = await this.client.hgetall(hash);
      if (!values) return null;
      
      const result = {};
      for (const [key, value] of Object.entries(values)) {
        result[key] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      console.error('Redis hgetall error:', error);
      throw error;
    }
  }
}

export const redisRepository = new RedisRepository(); 