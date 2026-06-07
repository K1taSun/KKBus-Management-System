import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, ChangeUserStatusDto, CreateRouteDto, UpdateRouteDto, OverrideScheduleDto, CreatePricingPolicyDto } from './dto/owner.dto';
import { PublicInfoService } from '../public-info/public-info.service';

@Injectable()
export class OwnerService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly publicInfoService: PublicInfoService,
  ) {}

  // ==========================================
  // Domain 1: Global User & Role Management
  // ==========================================
  
  async getUsers() {
    const res = await this.dataSource.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.status, json_build_object('name', r.name) as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    return res;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, firstName, lastName, phone, roleId, password } = createUserDto;
    
    // Validate email uniqueness
    const emailCheck = await this.dataSource.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.length > 0) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const res = await this.dataSource.query(
      `INSERT INTO users (email, first_name, last_name, phone, role_id, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role_id`,
      [email, firstName, lastName, phone, roleId, passwordHash]
    );
    
    return res[0];
  }

  async changeUserStatus(userId: string, changeStatusDto: ChangeUserStatusDto) {
    const res = await this.dataSource.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status',
      [changeStatusDto.status, userId]
    );
    if (res.length === 0) throw new BadRequestException('User not found');
    return res[0];
  }

  async overrideUserPassword(userId: string, newPassword: string) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);
    
    await this.dataSource.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
    return { message: 'Password successfully overridden' };
  }

  // ==========================================
  // Domain 2: Route & Course Orchestration
  // ==========================================

  async getRoutes() {
    const res = await this.dataSource.query('SELECT * FROM routes ORDER BY id DESC');
    return res;
  }

  async createRoute(createRouteDto: CreateRouteDto) {
    const { name, totalDistanceKm, stops } = createRouteDto;
    const res = await this.dataSource.query(
      `INSERT INTO routes (name, total_distance_km, stops, is_active)
       VALUES ($1, $2, $3, TRUE) RETURNING *`,
      [name, totalDistanceKm, JSON.stringify(stops)]
    );
    return res[0];
  }

  async updateRoute(routeId: number, updateRouteDto: UpdateRouteDto) {
    // We build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (updateRouteDto.name !== undefined) {
      updates.push(`name = $${i++}`);
      values.push(updateRouteDto.name);
    }
    if (updateRouteDto.totalDistanceKm !== undefined) {
      updates.push(`total_distance_km = $${i++}`);
      values.push(updateRouteDto.totalDistanceKm);
    }
    if (updateRouteDto.stops !== undefined) {
      updates.push(`stops = $${i++}`);
      values.push(JSON.stringify(updateRouteDto.stops));
    }

    if (updates.length === 0) {
      const res = await this.dataSource.query('SELECT * FROM routes WHERE id = $1', [routeId]);
      if (res.length === 0) throw new BadRequestException('Route not found');
      return res[0];
    }

    values.push(routeId);
    const query = `UPDATE routes SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
    
    const res = await this.dataSource.query(query, values);
    if (res.length === 0) throw new BadRequestException('Route not found');
    return res[0];
  }

  async deactivateRoute(routeId: number) {
    // Soft delete
    const res = await this.dataSource.query(
      'UPDATE routes SET is_active = FALSE WHERE id = $1 RETURNING id, is_active',
      [routeId]
    );
    if (res.length === 0) throw new BadRequestException('Route not found');

    // Inwalidacja cache rozkładu jazdy
    this.publicInfoService.clearTimetableCache();

    return res[0];
  }

  // ==========================================
  // Domain 3: Global Schedule Oversight
  // ==========================================

  async getSchedules(date?: string) {
    let query = `
      SELECT s.id, s.departure_time, s.arrival_time, 'Aktywny' AS status,
             json_build_object('id', u.id, 'first_name', u.first_name, 'last_name', u.last_name) as driver,
             json_build_object('id', b.id, 'registration_number', b.registration_number) as bus,
             json_build_object('name', r.name) as route
      FROM schedules s
      JOIN users u ON s.driver_id = u.id
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
    `;
    const params = [];
    if (date) {
      query += ` WHERE DATE(s.departure_time) = $1`;
      params.push(date);
    }
    query += ` ORDER BY s.departure_time ASC`;

    const res = await this.dataSource.query(query, params);
    return res;
  }

  async overrideSchedule(scheduleId: number, dto: OverrideScheduleDto) {
    // Basic conflict validation
    if (dto.driverId || dto.departureTime || dto.arrivalTime) {
      // Find current schedule
      const currentRes = await this.dataSource.query('SELECT * FROM schedules WHERE id = $1', [scheduleId]);
      if (currentRes.length === 0) throw new BadRequestException('Schedule not found');
      const current = currentRes[0];

      const driverId = dto.driverId || current.driver_id;
      const depTime = dto.departureTime || current.departure_time;
      const arrTime = dto.arrivalTime || current.arrival_time;

      if (new Date(arrTime) <= new Date(depTime)) {
        throw new BadRequestException('Arrival time must be after departure time');
      }

      // Check overlapping shifts for driver
      const overlapQuery = `
        SELECT id FROM schedules
        WHERE driver_id = $1 AND id != $2
        AND (
          (departure_time < $4 AND arrival_time > $3)
        )
      `;
      const overlaps = await this.dataSource.query(overlapQuery, [driverId, scheduleId, depTime, arrTime]);
      if (overlaps.length > 0) {
        throw new ConflictException('Driver has an overlapping schedule');
      }
    }

    // Prepare dynamic update
    const updates = [];
    const values = [];
    let i = 1;

    if (dto.driverId) { updates.push(`driver_id = $${i++}`); values.push(dto.driverId); }
    if (dto.busId) { updates.push(`bus_id = $${i++}`); values.push(dto.busId); }
    if (dto.departureTime) { updates.push(`departure_time = $${i++}`); values.push(dto.departureTime); }
    if (dto.arrivalTime) { updates.push(`arrival_time = $${i++}`); values.push(dto.arrivalTime); }

    if (updates.length === 0) return { message: 'No changes provided' };

    values.push(scheduleId);
    const query = `UPDATE schedules SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
    
    const res = await this.dataSource.query(query, values);
    return res[0];
  }

  // ==========================================
  // Domain 4: Financial Policy & Loyalty
  // ==========================================

  async createPricingPolicy(dto: CreatePricingPolicyDto) {
    // Archive old policy
    await this.dataSource.query('UPDATE pricing_policies SET is_current = FALSE WHERE is_current = TRUE');

    const res = await this.dataSource.query(
      `INSERT INTO pricing_policies 
        (version_name, base_price_multiplier, student_discount_percent, child_discount_percent, loyalty_point_value, is_current)
       VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
      [dto.versionName, dto.basePriceMultiplier, dto.studentDiscountPercent, dto.childDiscountPercent, dto.loyaltyPointValue]
    );

    // Inwalidacja cache cen/zniżek
    this.publicInfoService.clearPricingCache();

    return res[0];
  }

  // ==========================================
  // Domain 5: Advanced Analytics & Reporting
  // ==========================================

  async getFinancialAnalytics(startDate: string, endDate: string) {
    // Calculates revenue from completed payments joined with reservations and schedules
    const query = `
      SELECT 
        DATE(p.created_at) as date,
        COUNT(p.id) as total_transactions,
        SUM(p.amount) as total_revenue
      FROM payments p
      JOIN reservations r ON p.reservation_id = r.id
      JOIN schedules s ON r.schedule_id = s.id
      WHERE p.status = 'Zakończona'
        AND s.departure_time >= $1::timestamp 
        AND s.departure_time <= $2::timestamp
      GROUP BY DATE(p.created_at)
      ORDER BY DATE(p.created_at) ASC
    `;
    const res = await this.dataSource.query(query, [startDate, endDate]);
    
    const summary = await this.dataSource.query(`
      SELECT SUM(p.amount) as total 
      FROM payments p 
      JOIN reservations r ON p.reservation_id = r.id
      JOIN schedules s ON r.schedule_id = s.id
      WHERE p.status = 'Zakończona' 
      AND s.departure_time >= $1::timestamp 
      AND s.departure_time <= $2::timestamp
    `, [startDate, endDate]);

    return {
      totalRevenue: summary[0].total || 0,
      dailyBreakdown: res
    };
  }

  async getFuelAndCourseAnalytics(startDate: string, endDate: string) {
    const query = `
      SELECT 
        r.name as route_name,
        COUNT(rr.id) as completed_courses,
        SUM(rr.actual_passengers) as total_passengers,
        SUM(rr.fuel_liters) as total_fuel_liters,
        SUM(rr.fuel_cost) as total_fuel_cost,
        AVG(rr.average_fuel_consumption) as avg_consumption
      FROM route_reports rr
      JOIN schedules s ON rr.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      WHERE rr.status = 'Zatwierdzony'
        AND s.departure_time >= $1::timestamp 
        AND s.departure_time <= $2::timestamp
      GROUP BY r.id, r.name
    `;
    const res = await this.dataSource.query(query, [startDate, endDate]);
    return res;
  }
}
