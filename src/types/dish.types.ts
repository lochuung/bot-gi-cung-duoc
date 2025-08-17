export interface DishDto {
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
    picked: DishDto | null;
    suggestions: DishDto[];
    total: number;
}
