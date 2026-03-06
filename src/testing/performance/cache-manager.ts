interface CacheOptions {
  ttl: number; // Time to live in seconds
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private ttl: number;

  constructor(options: CacheOptions) {
    this.cache = new Map();
    this.ttl = options.ttl * 1000; // Convert to milliseconds
  }

  async set<T>(key: string, value: T): Promise<void> {
    const expiresAt = Date.now() + this.ttl;
    this.cache.set(key, { value, expiresAt });
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

// Global cache instance
const globalCache = new CacheManager({ ttl: 3600 });

export async function getCachedAnalysis<T>(key: string): Promise<T | null> {
  return globalCache.get<T>(key);
}

export async function setCachedAnalysis<T>(key: string, value: T): Promise<void> {
  return globalCache.set(key, value);
}
