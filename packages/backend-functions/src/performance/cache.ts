/**
 * In-memory cache for brand assets and frequently accessed data
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTtl: number;

  constructor(defaultTtl: number = 3600000) {
    // Default 1 hour
    this.defaultTtl = defaultTtl;
  }

  set(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTtl);
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }
}

// Singleton instances for different data types
export const brandAssetsCache = new InMemoryCache(3600000); // 1 hour
export const templatesCache = new InMemoryCache(3600000); // 1 hour
export const complianceRulesCache = new InMemoryCache(7200000); // 2 hours
