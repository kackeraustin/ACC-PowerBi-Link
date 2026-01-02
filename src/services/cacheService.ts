import NodeCache from 'node-cache';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: 120,
      useClones: false
    });

    this.cache.on('set', (key) => {
      logger.debug(`Cache set: ${key}`);
    });

    this.cache.on('expired', (key) => {
      logger.debug(`Cache expired: ${key}`);
    });
  }

  public get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value) {
      logger.debug(`Cache hit: ${key}`);
    } else {
      logger.debug(`Cache miss: ${key}`);
    }
    return value;
  }

  public set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  public del(key: string): number {
    return this.cache.del(key);
  }

  public flush(): void {
    this.cache.flushAll();
    logger.info('Cache flushed');
  }

  public getStats() {
    return this.cache.getStats();
  }
}

export const cacheService = new CacheService();
