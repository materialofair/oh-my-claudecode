export class CacheManager {
    cache;
    ttl;
    constructor(options) {
        this.cache = new Map();
        this.ttl = options.ttl * 1000; // Convert to milliseconds
    }
    async set(key, value) {
        const expiresAt = Date.now() + this.ttl;
        this.cache.set(key, { value, expiresAt });
    }
    async get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    async clear() {
        this.cache.clear();
    }
    async delete(key) {
        this.cache.delete(key);
    }
}
// Global cache instance
const globalCache = new CacheManager({ ttl: 3600 });
export async function getCachedAnalysis(key) {
    return globalCache.get(key);
}
export async function setCachedAnalysis(key, value) {
    return globalCache.set(key, value);
}
//# sourceMappingURL=cache-manager.js.map