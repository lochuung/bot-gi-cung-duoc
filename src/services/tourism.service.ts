import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tourism } from '@app/entities/tourism.entity';
import { DidauConfig } from '@app/config/didau.config';
import { RedisService } from '@app/services/redis.service';
import { fisherYatesShuffle } from '@app/utils/common';
import { TourismFilterOption } from '@app/types/tourism.types';

@Injectable()
export class TourismService {
  private fallbackPlaces = DidauConfig.FALLBACK_PLACES;

  constructor(
    @InjectRepository(Tourism)
    private readonly tourismRepo: Repository<Tourism>,
    private readonly redisService: RedisService,
  ) {}

  private normalize(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  parseFilters(args: string[]): TourismFilterOption {
    const input = args.join(' ').toLowerCase();
    const filters: TourismFilterOption = {};

    for (const kw of DidauConfig.REGION_KEYWORDS) {
      if (input.includes(kw)) {
        if (kw.includes('bắc')) filters.region = 'Miền Bắc';
        else if (kw.includes('trung')) filters.region = 'Miền Trung';
        else if (kw.includes('nam')) filters.region = 'Miền Nam';
        break;
      }
    }

    for (const kw of DidauConfig.PROVINCE_KEYWORDS) {
      if (input.includes(kw)) {
        filters.province = kw;
        break;
      }
    }

    return filters;
  }

  async findRandomPlace(filters?: TourismFilterOption, username?: string) {
    let qb = this.tourismRepo.createQueryBuilder('t');

    if (filters?.region) {
      qb = qb.andWhere('unaccent(t.region) ILIKE unaccent(:region)', {
        region: `%${filters.region}%`,
      });
    }

    if (filters?.province) {
      qb = qb.andWhere('unaccent(t.province) ILIKE unaccent(:province)', {
        province: `%${filters.province}%`,
      });
    }

    let excludeIds: number[] = [];
    if (username) {
      excludeIds = await this.getRecentPlaceIds(username);
      if (excludeIds.length > 0) {
        qb = qb.andWhere('t.id NOT IN (:...excludeIds)', { excludeIds });
      }
    }

    let rows = await qb
      .orderBy('RANDOM()')
      .limit(DidauConfig.MAX_RANDOM_PLACES)
      .getMany();

    // fallback nếu exclude quá nhiều
    if (rows.length === 0 && excludeIds.length > 0) {
      qb = this.tourismRepo.createQueryBuilder('t');
      if (filters?.region)
        qb = qb.andWhere('unaccent(t.region) ILIKE unaccent(:region)', {
          region: `%${filters.region}%`,
        });
      if (filters?.province)
        qb = qb.andWhere('unaccent(t.province) ILIKE unaccent(:province)', {
          province: `%${filters.province}%`,
        });
      rows = await qb
        .orderBy('RANDOM()')
        .limit(DidauConfig.MAX_RANDOM_PLACES)
        .getMany();
    }

    if (rows.length === 0) {
      return this.findFromFallback(filters);
    }

    const [picked, ...rest] = rows;
    if (username && picked?.id) {
      await this.saveRecentPlace(username, picked.id);
    }

    return {
      picked,
      suggestions: rest.slice(0, DidauConfig.MAX_SUGGESTIONS),
      total: rows.length,
    };
  }

  private findFromFallback(filters?: TourismFilterOption) {
    let data = [...this.fallbackPlaces];

    if (filters?.region) {
      const reg = this.normalize(filters.region);
      data = data.filter((p) => this.normalize(p.region).includes(reg));
    }

    if (filters?.province) {
      const prov = this.normalize(filters.province);
      data = data.filter((p) => this.normalize(p.province).includes(prov));
    }

    if (data.length === 0) return { picked: null, suggestions: [], total: 0 };

    const shuffled = fisherYatesShuffle(data);
    return {
      picked: shuffled[0],
      suggestions: shuffled.slice(1, 1 + DidauConfig.MAX_SUGGESTIONS),
      total: data.length,
    };
  }

  private async getRecentPlaceIds(username: string) {
    const key = `recent_places:${username}`;
    return (await this.redisService.get<number[]>(key)) || [];
  }

  private async saveRecentPlace(username: string, placeId: number) {
    const key = `recent_places:${username}`;
    let ids = (await this.redisService.get<number[]>(key)) || [];
    ids.unshift(placeId);
    ids = ids.slice(0, DidauConfig.MAX_RECENT_PLACES);
    await this.redisService.set(key, ids, DidauConfig.RECENT_PLACES_TTL);
  }

  async clearRecentPlaces(username: string) {
    await this.redisService.del(`recent_places:${username}`);
  }

  async getAvailableRegions(): Promise<string[]> {
    const result = await this.tourismRepo
      .createQueryBuilder('t')
      .select('DISTINCT t.region', 'region')
      .getRawMany();
    return result.length > 0
      ? result.map((r) => r.region)
      : [...new Set(this.fallbackPlaces.map((p) => p.region))];
  }

  async getAvailableProvinces(): Promise<string[]> {
    const result = await this.tourismRepo
      .createQueryBuilder('t')
      .select('DISTINCT t.province', 'province')
      .getRawMany();
    return result.length > 0
      ? result.map((r) => r.province)
      : [...new Set(this.fallbackPlaces.map((p) => p.province))];
  }
}
