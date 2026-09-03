import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Run periodic sweep every 60 seconds to prune expired keys
    this.cleanupInterval = setInterval(() => {
      this.pruneExpired();
    }, 60000);
  }

  /**
   * Retrieve cached value if unexpired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set cache key with time-to-live in milliseconds (default: 60s)
   */
  set<T>(key: string, value: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Invalidate specific key
   */
  del(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix (e.g. 'inventory:*')
   */
  delByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire in-memory cache
   */
  clear(): void {
    this.cache.clear();
  }

  private pruneExpired(): void {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        pruned++;
      }
    }
    if (pruned > 0) {
      this.logger.debug(`Pruned ${pruned} expired cache entries.`);
    }
  }
}
