import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PublicInfoService {
  private cache = new Map<string, { data: any; expiresAt: number }>();

  constructor(private readonly dataSource: DataSource) {}

  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  }

  private setCached(key: string, data: any, ttlMs: number) {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  }

  async getRoutesAndTimetable() {
    const cacheKey = 'routes_timetable';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.dataSource.query(`
      SELECT 
        s.id as schedule_id,
        s.departure_time,
        s.arrival_time,
        s.price_base,
        r.name as route_name,
        r.total_distance_km,
        b.model as bus_model,
        b.capacity
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      WHERE s.departure_time >= NOW()
      ORDER BY s.departure_time ASC
    `);

    // Cache na 5 minut (300 000 ms)
    this.setCached(cacheKey, data, 300000);
    return data;
  }

  async getPricingAndDiscounts() {
    const cacheKey = 'pricing_discounts';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = {
      basePrice: 25.00,
      currency: 'PLN',
      discounts: [
        { name: 'Studencka', multiplier: 0.49, valuePct: 51, description: 'Dla studentów do 26 roku życia.' },
        { name: 'Szkolna', multiplier: 0.63, valuePct: 37, description: 'Dla dzieci i młodzieży szkolnej.' },
        { name: 'Dziecięca (do lat 4)', multiplier: 0.00, valuePct: 100, description: 'Podróż na kolanach opiekuna.' }
      ]
    };

    // Cache na 1 godzinę (3 600 000 ms)
    this.setCached(cacheKey, data, 3600000);
    return data;
  }
}
