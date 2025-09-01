import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DishDto, DishFilterOptions, DishSearchResult } from '@app/types/dish.types';
import { Dish } from '@app/entities/dish.entity';
import { AngiConfig } from '@app/config/angi.config';
import { fisherYatesShuffle } from '@app/utils/common';
import { RedisService } from '@app/services/redis.service';
import { ANGI_MESSAGES } from '@app/messages/angi.messages';

@Injectable()
export class DishService {
    private fallbackDishes: DishDto[] = AngiConfig.FALLBACK_DISHES;

    constructor(
        @InjectRepository(Dish)
        private readonly dishRepository: Repository<Dish>,
        private readonly redisService: RedisService,
    ) { }

    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    async findRandomDish(filters?: DishFilterOptions, username?: string): Promise<DishSearchResult> {
        try {
            const qb = this.dishRepository.createQueryBuilder('dishes');

            if (filters?.region) {
                qb.andWhere(`unaccent(dishes.region) ILIKE unaccent(:region)`, {
                    region: `%${filters.region}%`,
                });
            }

            if (filters?.category) {
                qb.andWhere(`unaccent(dishes.category) ILIKE unaccent(:category)`, {
                    category: `%${filters.category}%`,
                });
            }

            // Get recent dishes for user to avoid duplicates
            let excludeDishIds: number[] = [];
            if (username) {
                excludeDishIds = await this.getRecentDishIds(username);
                if (excludeDishIds.length > 0) {
                    qb.andWhere('dishes.id NOT IN (:...excludeIds)', { excludeIds: excludeDishIds });
                }
            }

            let rows = await qb
                .orderBy('RANDOM()')
                .limit(AngiConfig.MAX_RANDOM_DISHES)
                .getMany();

            // If no dishes found with exclusions, try without exclusions
            if (rows.length === 0 && excludeDishIds.length > 0) {
                rows = await this.dishRepository.createQueryBuilder('dishes')
                    .where(filters?.region ? `unaccent(dishes.region) ILIKE unaccent(:region)` : '1=1', {
                        region: `%${filters?.region}%`,
                    })
                    .andWhere(filters?.category ? `unaccent(dishes.category) ILIKE unaccent(:category)` : '1=1', {
                        category: `%${filters?.category}%`,
                    })
                    .orderBy('RANDOM()')
                    .limit(AngiConfig.MAX_RANDOM_DISHES)
                    .getMany();
            }

            if (rows.length === AngiConfig.EMPTY_TOTAL) {
                console.log(ANGI_MESSAGES.LOG.DATABASE_EMPTY_FALLBACK);
                return this.findRandomDishFromArray(this.fallbackDishes, filters, username);
            }

            const [picked, ...rest] = rows;

            // Save the picked dish for this user to avoid repeating
            if (username && picked && 'id' in picked) {
                await this.saveRecentDish(username, picked.id);
            }

            return {
                picked,
                suggestions: rest.slice(0, AngiConfig.MAX_SUGGESTIONS),
                total: rows.length,
            };
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_FINDING_DISH, error);
            return this.findRandomDishFromArray(this.fallbackDishes, filters, username);
        }
    }

    private findRandomDishFromArray(
        dishes: DishDto[],
        filters?: DishFilterOptions,
        username?: string,
    ): DishSearchResult {
        let filteredDishes = [...dishes];

        if (filters?.region) {
            const normalizedRegion = this.normalizeText(filters.region);
            filteredDishes = filteredDishes.filter(
                dish =>
                    this.normalizeText(dish.region).includes(normalizedRegion) ||
                    normalizedRegion.includes(this.normalizeText(dish.region)),
            );
        }

        if (filters?.category) {
            const normalizedCategory = this.normalizeText(filters.category);
            filteredDishes = filteredDishes.filter(
                dish =>
                    this.normalizeText(dish.category).includes(normalizedCategory) ||
                    normalizedCategory.includes(this.normalizeText(dish.category)),
            );
        }

        if (filteredDishes.length === AngiConfig.EMPTY_TOTAL) {
            return { picked: null, suggestions: [], total: AngiConfig.EMPTY_TOTAL };
        }

        const shuffled = fisherYatesShuffle(filteredDishes);
        const picked = shuffled[0];
        const suggestions = shuffled.slice(1, 1 + AngiConfig.MAX_SUGGESTIONS);

        return {
            picked,
            suggestions,
            total: filteredDishes.length,
        };
    }

    parseFilters(args: string[]): DishFilterOptions {
        const joinedArgs = args.join(' ').toLowerCase();
        const filters: DishFilterOptions = {};

        for (const region of AngiConfig.REGION_KEYWORDS) {
            if (joinedArgs.includes(region)) {
                if (region.includes('bắc')) filters.region = 'Miền Bắc';
                else if (region.includes('trung')) filters.region = 'Miền Trung';
                else if (region.includes('nam')) filters.region = 'Miền Nam';
                break;
            }
        }

        for (const category of AngiConfig.CATEGORY_KEYWORDS) {
            if (joinedArgs.includes(category)) {
                if (category.includes('chính')) filters.category = 'Món Chính';
                else if (category.includes('phụ')) filters.category = 'Món Phụ';
                else if (category.includes('tráng')) filters.category = 'Tráng Miệng';
                else if (category.includes('vặt')) filters.category = 'Ăn Vặt';
                else if (category.includes('uống')) filters.category = 'Đồ Uống';
                break;
            }
        }

        return filters;
    }

    /**
     * Get all available regions
     */
    async getAvailableRegions(): Promise<string[]> {
        try {
            const result = await this.dishRepository
                .createQueryBuilder('dishes')
                .select('DISTINCT dishes.region', 'region')
                .getRawMany();

            if (result.length === 0) {
                console.log(ANGI_MESSAGES.LOG.DATABASE_EMPTY_REGIONS);
                return [...new Set(this.fallbackDishes.map(dish => dish.region))];
            }

            return result.map(item => item.region);
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_GETTING_REGIONS, error);
            return [...new Set(this.fallbackDishes.map(dish => dish.region))];
        }
    }

    /**
     * Get all available categories
     */
    async getAvailableCategories(): Promise<string[]> {
        try {
            const result = await this.dishRepository
                .createQueryBuilder('dishes')
                .select('DISTINCT dishes.category', 'category')
                .getRawMany();

            if (result.length === 0) {
                console.log(ANGI_MESSAGES.LOG.DATABASE_EMPTY_CATEGORIES);
                return [...new Set(this.fallbackDishes.map(dish => dish.category))];
            }

            return result.map(item => item.category);
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_GETTING_CATEGORIES, error);
            return [...new Set(this.fallbackDishes.map(dish => dish.category))];
        }
    }

    /**
     * Get recent dish IDs for a user to avoid duplicates
     */
    private async getRecentDishIds(username: string): Promise<number[]> {
        try {
            const key = `${ANGI_MESSAGES.REDIS_KEYS.RECENT_DISHES_PREFIX}${username}`;
            const recentDishes = await this.redisService.get<number[]>(key);
            return recentDishes || [];
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_GETTING_RECENT_DISHES, error);
            return [];
        }
    }

    /**
     * Save a dish ID as recently suggested for a user
     */
    private async saveRecentDish(username: string, dishId: number): Promise<void> {
        try {
            const key = `${ANGI_MESSAGES.REDIS_KEYS.RECENT_DISHES_PREFIX}${username}`;
            let recentDishes = await this.redisService.get<number[]>(key) || [];

            // Add new dish to the beginning
            recentDishes.unshift(dishId);

            // Keep only the most recent dishes
            recentDishes = recentDishes.slice(0, AngiConfig.MAX_RECENT_DISHES);

            // Save back to Redis with TTL
            await this.redisService.set(key, recentDishes, AngiConfig.RECENT_DISHES_TTL);
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_SAVING_RECENT_DISH, error);
        }
    }

    /**
     * Clear recent dishes for a user
     */
    async clearRecentDishes(username: string): Promise<void> {
        try {
            const key = `${ANGI_MESSAGES.REDIS_KEYS.RECENT_DISHES_PREFIX}${username}`;
            await this.redisService.del(key);
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_CLEARING_RECENT_DISHES, error);
        }
    }

    /**
     * Get dish statistics
     */
    async getDishStatistics(): Promise<{
        totalDishes: number;
        dishesPerRegion: Record<string, number>;
        dishesPerCategory: Record<string, number>;
    }> {
        try {
            const [total, regionStats, categoryStats] = await Promise.all([
                this.dishRepository.count(),
                this.dishRepository
                    .createQueryBuilder('dishes')
                    .select('dishes.region', 'region')
                    .addSelect('COUNT(*)', 'count')
                    .groupBy('dishes.region')
                    .getRawMany(),
                this.dishRepository
                    .createQueryBuilder('dishes')
                    .select('dishes.category', 'category')
                    .addSelect('COUNT(*)', 'count')
                    .groupBy('dishes.category')
                    .getRawMany(),
            ]);

            const dishesPerRegion: Record<string, number> = {};
            const dishesPerCategory: Record<string, number> = {};

            regionStats.forEach(stat => {
                dishesPerRegion[stat.region] = parseInt(stat.count);
            });

            categoryStats.forEach(stat => {
                dishesPerCategory[stat.category] = parseInt(stat.count);
            });

            return {
                totalDishes: total,
                dishesPerRegion,
                dishesPerCategory,
            };
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_GETTING_STATISTICS, error);
            return {
                totalDishes: this.fallbackDishes.length,
                dishesPerRegion: {},
                dishesPerCategory: {},
            };
        }
    }

    /**
     * Create a new dish
     */
    async createDish(dishData: Omit<DishDto, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dish> {
        try {
            const dish = this.dishRepository.create(dishData);
            return await this.dishRepository.save(dish);
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_CREATING_DISH, error);
            throw error;
        }
    }

    /**
     * Update a dish
     */
    async updateDish(id: number, dishData: Partial<Omit<DishDto, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Dish | null> {
        try {
            await this.dishRepository.update(id, dishData);
            return await this.dishRepository.findOne({ where: { id } });
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_UPDATING_DISH, error);
            throw error;
        }
    }

    /**
     * Delete a dish
     */
    async deleteDish(id: number): Promise<boolean> {
        try {
            const result = await this.dishRepository.delete(id);
            return result.affected > 0;
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_DELETING_DISH, error);
            throw error;
        }
    }

    /**
     * Find dish by ID
     */
    async findDishById(id: number): Promise<Dish | null> {
        try {
            return await this.dishRepository.findOne({ where: { id } });
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_FINDING_DISH_BY_ID, error);
            return null;
        }
    }

    /**
     * Search dishes by name
     */
    async searchDishes(searchTerm: string, limit: number = 10): Promise<Dish[]> {
        try {
            return await this.dishRepository
                .createQueryBuilder('dishes')
                .where('unaccent(dishes.name) ILIKE unaccent(:searchTerm)', {
                    searchTerm: `%${searchTerm}%`,
                })
                .limit(limit)
                .getMany();
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_SEARCHING_DISHES, error);
            return [];
        }
    }

    async getRecentDishesForUser(username: string): Promise<Dish[]> {
        try {
            const key = `${ANGI_MESSAGES.REDIS_KEYS.RECENT_DISHES_PREFIX}${username}`;
            const recentDishes = await this.redisService.get(key);
            const dishIds = Array.isArray(recentDishes) ? recentDishes : [];
            return await this.dishRepository.findBy({
                id: In(dishIds),
            });
        } catch (error) {
            console.error(ANGI_MESSAGES.LOG.ERROR_GETTING_USER_RECENT_DISHES, error);
            return [];
        }
    }
}
