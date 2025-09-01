export const DISH_ADMIN_CONSTANTS = {
    VALID_FIELDS: ['name', 'province', 'region', 'category'] as const,
    MAX_SEARCH_RESULTS: 10,
} as const;

export type DishField = typeof DISH_ADMIN_CONSTANTS.VALID_FIELDS[number];

export interface DishData {
    name: string;
    province: string;
    region: string;
    category: string;
}
