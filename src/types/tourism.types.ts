export interface TourismDto {
  address: string;
  province: string;
  region: string;
}

export interface TourismFilterOption {
  province?: string;
  region?: string;
}

export interface TourismSearchResult {
  picked: TourismDto | null;
  suggestions: TourismDto[];
  total: number;
}
