import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@app/services/redis.service';

export interface GiDayOption {
    value: string;
    addedAt: Date;
}

export interface GiDayRandomResult {
    chosenOption: string;
    chosenIndex: number;
    allOptions: string[];
    totalOptions: number;
}

export interface GiDayValidationResult {
    isValid: boolean;
    error?: string;
}

export interface GiDayListResult {
    options: string[];
    totalOptions: number;
    maxOptions: number;
}

@Injectable()
export class GiDayService {
    private readonly logger = new Logger(GiDayService.name);
    private readonly REDIS_PREFIX = 'giday_options';
    private readonly REDIS_TTL = 24 * 60 * 60; // 24 hours
    private readonly MAX_OPTIONS = 20;
    private readonly MAX_OPTION_LENGTH = 100;
    private readonly MIN_OPTIONS_FOR_RANDOM = 2;

    constructor(private readonly redisService: RedisService) {}

    /**
     * Validates an option before adding to the list
     */
    validateOption(option: string): GiDayValidationResult {
        if (!option || option.trim().length === 0) {
            return {
                isValid: false,
                error: '❌ Lựa chọn không được để trống!'
            };
        }

        if (option.length > this.MAX_OPTION_LENGTH) {
            return {
                isValid: false,
                error: `❌ Lựa chọn quá dài! Tối đa ${this.MAX_OPTION_LENGTH} ký tự.`
            };
        }

        return { isValid: true };
    }

    /**
     * Validates a list of options for direct mode
     */
    validateDirectModeOptions(options: string[]): GiDayValidationResult {
        if (options.length < this.MIN_OPTIONS_FOR_RANDOM) {
            return {
                isValid: false,
                error: '❌ Cần ít nhất 2 lựa chọn để random!\n💡 Ví dụ: `!giday pizza, burger, phở`'
            };
        }

        for (const option of options) {
            const validation = this.validateOption(option);
            if (!validation.isValid) {
                return validation;
            }
        }

        return { isValid: true };
    }

    /**
     * Performs random selection from a list of options
     */
    performRandomSelection(options: string[]): GiDayRandomResult {
        const randomIndex = Math.floor(Math.random() * options.length);
        const chosenOption = options[randomIndex];

        return {
            chosenOption,
            chosenIndex: randomIndex,
            allOptions: options,
            totalOptions: options.length
        };
    }

    /**
     * Gets the Redis key for a specific user
     */
    private getUserRedisKey(userId: string): string {
        return `${this.REDIS_PREFIX}:${userId}`;
    }

    /**
     * Retrieves options from Redis for a user
     */
    async getUserOptions(userId: string): Promise<string[]> {
        const redisKey = this.getUserRedisKey(userId);
        
        try {
            const optionsJson = await this.redisService.get<string>(redisKey);
            if (!optionsJson) return [];
            
            const options = JSON.parse(optionsJson);
            if (!Array.isArray(options)) {
                this.logger.warn(`Invalid options format for user ${userId}, resetting to empty array`);
                await this.clearUserOptions(userId);
                return [];
            }
            
            return options;
        } catch (error) {
            this.logger.error(`Failed to get options for user ${userId}:`, error);
            return [];
        }
    }

    /**
     * Adds an option to user's list
     */
    async addUserOption(userId: string, option: string): Promise<{ success: boolean; error?: string; newTotal?: number }> {
        // Validate the option
        const validation = this.validateOption(option);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        try {
            const existingOptions = await this.getUserOptions(userId);
            
            // Check if option already exists
            if (existingOptions.includes(option)) {
                return { 
                    success: false, 
                    error: `❌ Lựa chọn "${option}" đã tồn tại!\n📋 Dùng \`!giday list\` để xem danh sách hiện tại.`
                };
            }

            // Check if max limit reached
            if (existingOptions.length >= this.MAX_OPTIONS) {
                return { 
                    success: false, 
                    error: `❌ Đã đạt giới hạn tối đa ${this.MAX_OPTIONS} lựa chọn!\n🧹 Dùng \`!giday clear\` để xóa hết và bắt đầu lại.`
                };
            }

            // Add the new option
            const newOptions = [...existingOptions, option];
            const redisKey = this.getUserRedisKey(userId);
            
            await this.redisService.set(redisKey, JSON.stringify(newOptions), this.REDIS_TTL);
            
            return { success: true, newTotal: newOptions.length };
        } catch (error) {
            this.logger.error(`Failed to add option for user ${userId}:`, error);
            return { 
                success: false, 
                error: '❌ **Lỗi hệ thống!** Không thể lưu lựa chọn. Vui lòng thử lại.'
            };
        }
    }

    /**
     * Gets user's options list with metadata
     */
    async getUserOptionsList(userId: string): Promise<GiDayListResult> {
        const options = await this.getUserOptions(userId);
        
        return {
            options,
            totalOptions: options.length,
            maxOptions: this.MAX_OPTIONS
        };
    }

    /**
     * Performs random selection from user's saved options and clears the list
     */
    async randomizeAndClearUserOptions(userId: string): Promise<{ success: boolean; result?: GiDayRandomResult; error?: string }> {
        try {
            const options = await this.getUserOptions(userId);

            if (options.length === 0) {
                return {
                    success: false,
                    error: '❌ Chưa có lựa chọn nào!\n💡 Thêm lựa chọn với: `!giday add <option>`'
                };
            }

            if (options.length < this.MIN_OPTIONS_FOR_RANDOM) {
                return {
                    success: false,
                    error: '❌ Cần ít nhất 2 lựa chọn để random!\n💡 Thêm thêm với: `!giday add <option>`'
                };
            }

            const result = this.performRandomSelection(options);

            // Clear the options after successful randomization
            try {
                await this.clearUserOptions(userId);
            } catch (error) {
                this.logger.error(`Failed to clear options for user ${userId} after randomization:`, error);
                // Don't return error since the main operation succeeded
            }

            return { success: true, result };
        } catch (error) {
            this.logger.error(`Failed to randomize options for user ${userId}:`, error);
            return {
                success: false,
                error: '❌ **Lỗi hệ thống!** Không thể thực hiện random. Vui lòng thử lại.'
            };
        }
    }

    /**
     * Clears all options for a user
     */
    async clearUserOptions(userId: string): Promise<{ success: boolean; clearedCount?: number; error?: string }> {
        try {
            const options = await this.getUserOptions(userId);
            const clearedCount = options.length;

            if (clearedCount === 0) {
                return { success: true, clearedCount: 0 };
            }

            const redisKey = this.getUserRedisKey(userId);
            await this.redisService.del(redisKey);

            return { success: true, clearedCount };
        } catch (error) {
            this.logger.error(`Failed to clear options for user ${userId}:`, error);
            return {
                success: false,
                error: '❌ **Lỗi hệ thống!** Không thể xóa danh sách. Vui lòng thử lại.'
            };
        }
    }

    /**
     * Handles direct mode random selection (comma-separated options)
     */
    async handleDirectMode(optionsString: string): Promise<{ success: boolean; result?: GiDayRandomResult; error?: string }> {
        const options = optionsString
            .split(',')
            .map(opt => opt.trim())
            .filter(opt => opt.length > 0);

        const validation = this.validateDirectModeOptions(options);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        const result = this.performRandomSelection(options);
        return { success: true, result };
    }

    /**
     * Get service configuration constants
     */
    getConfig() {
        return {
            maxOptions: this.MAX_OPTIONS,
            maxOptionLength: this.MAX_OPTION_LENGTH,
            minOptionsForRandom: this.MIN_OPTIONS_FOR_RANDOM,
            redisTTL: this.REDIS_TTL
        };
    }
}
