/**
 * Caching Service with Memory Fallback
 */
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.ttlMap = new Map();
  }

  async get(key) {
    if (this.ttlMap.has(key)) {
      const expireTime = this.ttlMap.get(key);
      if (Date.now() > expireTime) {
        this.memoryCache.delete(key);
        this.ttlMap.delete(key);
        return null;
      }
    }
    return this.memoryCache.get(key) || null;
  }

  async set(key, value, ttlSeconds = 600) {
    this.memoryCache.set(key, value);
    this.ttlMap.set(key, Date.now() + ttlSeconds * 1000);
    return true;
  }

  async del(key) {
    this.memoryCache.delete(key);
    this.ttlMap.delete(key);
    return true;
  }

  async delPrefix(prefix) {
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
        this.ttlMap.delete(key);
      }
    }
    return true;
  }
}

module.exports = new CacheService();
