import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
    private readonly logger = new Logger(RedisService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    /**
     * Set a value in Redis with optional TTL
     * @param key - The key to set
     * @param value - The value to set
     * @param ttl - Time to live in seconds (optional)
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            await this.cacheManager.set(key, value, ttl);
            this.logger.debug(`Set key: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to set key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Get a value from Redis
     * @param key - The key to get
     * @returns The value or null if not found
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.cacheManager.get<T>(key);
            this.logger.debug(`Get key: ${key}, found: ${value !== null && value !== undefined}`);
            return value || null;
        } catch (error) {
            this.logger.error(`Failed to get key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Delete a key from Redis
     * @param key - The key to delete
     */
    async del(key: string): Promise<void> {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Deleted key: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to delete key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Check if a key exists in Redis
     * @param key - The key to check
     * @returns true if exists, false otherwise
     */
    async exists(key: string): Promise<boolean> {
        try {
            const value = await this.cacheManager.get(key);
            return value !== null && value !== undefined;
        } catch (error) {
            this.logger.error(`Failed to check key existence ${key}:`, error);
            return false;
        }
    }

    /**
     * Increment a numeric value in Redis
     * @param key - The key to increment
     * @param increment - The amount to increment by (default: 1)
     * @returns The new value
     */
    async incr(key: string, increment: number = 1): Promise<number> {
        try {
            const currentValue = await this.get<number>(key) || 0;
            const newValue = currentValue + increment;
            await this.set(key, newValue);
            this.logger.debug(`Incremented key: ${key}, new value: ${newValue}`);
            return newValue;
        } catch (error) {
            this.logger.error(`Failed to increment key ${key}:`, error);
            throw error;
        }
    }

    /**
     * Set multiple key-value pairs
     * @param pairs - Array of {key, value, ttl?} objects
     */
    async mset(pairs: Array<{key: string, value: any, ttl?: number}>): Promise<void> {
        try {
            await Promise.all(
                pairs.map(({ key, value, ttl }) => this.set(key, value, ttl))
            );
            this.logger.debug(`Set multiple keys: ${pairs.map(p => p.key).join(', ')}`);
        } catch (error) {
            this.logger.error('Failed to set multiple keys:', error);
            throw error;
        }
    }

    /**
     * Get multiple values by keys
     * @param keys - Array of keys to get
     * @returns Array of values in the same order as keys
     */
    async mget<T>(keys: string[]): Promise<(T | null)[]> {
        try {
            const values = await Promise.all(
                keys.map(key => this.get<T>(key))
            );
            this.logger.debug(`Got multiple keys: ${keys.join(', ')}`);
            return values;
        } catch (error) {
            this.logger.error('Failed to get multiple keys:', error);
            throw error;
        }
    }

    /**
     * Clear all keys (use with caution)
     * Note: This method may not be available in all cache implementations
     */
    async reset(): Promise<void> {
        try {
            // Note: reset() may not be available in all cache manager implementations
            // You might need to implement this differently based on your Redis setup
            this.logger.warn('Reset operation not implemented for this cache manager');
        } catch (error) {
            this.logger.error('Failed to reset cache:', error);
            throw error;
        }
    }
}
