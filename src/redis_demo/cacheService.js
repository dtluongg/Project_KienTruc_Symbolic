import { redisRepository } from './redisRepository.js';

class CacheService {
  constructor() {
    this.defaultTTL = 3600; // 1 hour
  }

  // Cache user data
  async cacheUser(userId, userData) {
    const key = `user:${userId}`;
    return await redisRepository.set(key, userData, this.defaultTTL);
  }

  // Get cached user data
  async getCachedUser(userId) {
    const key = `user:${userId}`;
    return await redisRepository.get(key);
  }

  // Cache product data
  async cacheProduct(productId, productData) {
    const key = `product:${productId}`;
    return await redisRepository.set(key, productData, this.defaultTTL);
  }

  // Get cached product data
  async getCachedProduct(productId) {
    const key = `product:${productId}`;
    return await redisRepository.get(key);
  }

  // Cache list of products
  async cacheProductList(products) {
    const key = 'products:list';
    return await redisRepository.set(key, products, this.defaultTTL);
  }

  // Get cached product list
  async getCachedProductList() {
    const key = 'products:list';
    return await redisRepository.get(key);
  }

  // Delete cached data
  async invalidateCache(key) {
    return await redisRepository.delete(key);
  }

  // Check if data exists in cache
  async isCached(key) {
    return await redisRepository.exists(key);
  }

  // Cache with custom TTL
  async cacheWithTTL(key, data, ttl) {
    return await redisRepository.set(key, data, ttl);
  }
}

export const cacheService = new CacheService(); 