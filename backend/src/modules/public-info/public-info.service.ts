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

  clearTimetableCache() {
    this.cache.delete('routes_timetable');
  }

  clearPricingCache() {
    this.cache.delete('pricing_discounts');
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
        r.stops,
        r.total_distance_km,
        b.model as bus_model,
        b.registration_number,
        b.capacity,
        b.capacity - COALESCE(res.booked, 0) as available_seats
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      LEFT JOIN (
        SELECT schedule_id, COUNT(*) as booked
        FROM reservations
        WHERE status != 'Anulowana'
        GROUP BY schedule_id
      ) res ON res.schedule_id = s.id
      WHERE s.departure_time >= NOW() AND r.is_active = TRUE
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

    // Pobranie aktualnej polityki cenowej z bazy danych
    const policyResult = await this.dataSource.query(
      `SELECT base_price_multiplier, student_discount_percent, child_discount_percent, loyalty_point_value
       FROM pricing_policies
       WHERE is_current = TRUE
       LIMIT 1`
    );

    const baseMultiplier = policyResult.length > 0 ? parseFloat(policyResult[0].base_price_multiplier) : 1.0;
    const studentDiscountPct = policyResult.length > 0 ? parseInt(policyResult[0].student_discount_percent, 10) : 51;
    const childDiscountPct = policyResult.length > 0 ? parseInt(policyResult[0].child_discount_percent, 10) : 30;

    const basePrice = 25.00 * baseMultiplier;

    const data = {
      basePrice: parseFloat(basePrice.toFixed(2)),
      currency: 'PLN',
      discounts: [
        { 
          name: 'Studencka', 
          multiplier: parseFloat(((100 - studentDiscountPct) / 100).toFixed(2)), 
          valuePct: studentDiscountPct, 
          description: 'Dla studentów do 26 roku życia.' 
        },
        { 
          name: 'Szkolna', 
          multiplier: parseFloat(((100 - childDiscountPct) / 100).toFixed(2)), 
          valuePct: childDiscountPct, 
          description: 'Dla dzieci i młodzieży szkolnej.' 
        },
        { 
          name: 'Dziecięca (do lat 4)', 
          multiplier: 0.00, 
          valuePct: 100, 
          description: 'Podróż na kolanach opiekuna.' 
        }
      ]
    };

    // Cache na 1 godzinę (3 600 000 ms)
    this.setCached(cacheKey, data, 3600000);
    return data;
  }

  async getRecentlyCompletedCourses() {
    return this.dataSource.query(`
      SELECT 
        rr.id,
        r.name as route_name,
        rr.submitted_at
      FROM route_reports rr
      JOIN schedules s ON rr.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      WHERE rr.status = 'Zatwierdzony'
      ORDER BY rr.submitted_at DESC
      LIMIT 5
    `);
  }
}
