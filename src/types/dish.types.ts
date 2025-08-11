export interface Dish {
    name: string;
    province: string;
    region: string;
    category: string;
}

export interface DishFilterOptions {
    region?: string;
    category?: string;
}

export interface DishSearchResult {
    picked: Dish | null;
    suggestions: Dish[];
    total: number;
}
