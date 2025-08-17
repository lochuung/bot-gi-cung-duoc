import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

export const redisConfig: CacheModuleAsyncOptions = {
    isGlobal: true,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
        return {
            store: redisStore,
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
            ttl: 300, // 5 minutes default TTL in seconds
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            lazyConnect: true,
            connectTimeout: 10000,
            commandTimeout: 5000,
        };
    },
};

export const REDIS_KEYS = {
    USER_SESSION: (userId: string) => `user:session:${userId}`,
    MESSAGE_CACHE: (messageId: string) => `message:${messageId}`,
    COMMAND_COOLDOWN: (userId: string, command: string) => `cooldown:${userId}:${command}`,
    DISH_SEARCH_CACHE: (query: string) => `dish:search:${query}`,
    USER_PREFERENCES: (userId: string) => `user:preferences:${userId}`,
} as const;
