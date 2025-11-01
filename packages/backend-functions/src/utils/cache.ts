/**
 * Simple in-memory cache utility for templates and rewrite responses.
 * In production, should be replaced with Azure Blob Storage or Redis.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private defaultTtl: number;

  constructor(defaultTtlSeconds: number = 3600) {
    this.defaultTtl = defaultTtlSeconds * 1000;
  }

  set(key: string, value: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds || this.defaultTtl / 1000) * 1000;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl
    });
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

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Clean expired entries
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Template cache (1 hour TTL)
export const templateCache = new SimpleCache<any[]>(3600);

// Rewrite cache (30 minutes TTL)
export const rewriteCache = new SimpleCache<string>(1800);

/**
 * Generate cache key from input
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}
