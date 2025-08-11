import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish, DishFilterOptions, DishSearchResult } from '@app/types/dish.types';
import { DishEntity } from '@app/entities/dish.entity';
import { AngiConfig } from '@app/config/angi.config';
import { fisherYatesShuffle } from '@app/utils/common';

@Injectable()
export class DishService {
    private fallbackDishes: Dish[] = AngiConfig.FALLBACK_DISHES;

    constructor(
        @InjectRepository(DishEntity)
        private readonly dishRepository: Repository<DishEntity>,
    ) { }

    private normalizeText(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    async findRandomDish(filters?: DishFilterOptions): Promise<DishSearchResult> {
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

            const rows = await qb
                .orderBy('RANDOM()')
                .limit(AngiConfig.MAX_RANDOM_DISHES)
                .getMany();

            if (rows.length === AngiConfig.EMPTY_TOTAL) {
                console.log('Database empty, using fallback data');
                return this.findRandomDishFromArray(this.fallbackDishes, filters);
            }

            const [picked, ...rest] = rows;
            return {
                picked,
                suggestions: rest.slice(0, AngiConfig.MAX_SUGGESTIONS),
                total: rows.length,
            };
        } catch (error) {
            console.error('Error finding random dish from database, using fallback:', error);
            return this.findRandomDishFromArray(this.fallbackDishes, filters);
        }
    }

    private findRandomDishFromArray(
        dishes: Dish[],
        filters?: DishFilterOptions,
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
                console.log('Database empty, using fallback regions');
                return [...new Set(this.fallbackDishes.map(dish => dish.region))];
            }

            return result.map(item => item.region);
        } catch (error) {
            console.error('Error getting available regions, using fallback:', error);
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
                console.log('Database empty, using fallback categories');
                return [...new Set(this.fallbackDishes.map(dish => dish.category))];
            }

            return result.map(item => item.category);
        } catch (error) {
            console.error('Error getting available categories, using fallback:', error);
            return [...new Set(this.fallbackDishes.map(dish => dish.category))];
        }
    }
}
