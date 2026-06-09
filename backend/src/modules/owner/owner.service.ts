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
  // Domeny 1: Zarządzanie użytkownikami i rolami
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
    const { name, totalDistanceKm, stops, label, description, color } = createRouteDto;
    const res = await this.dataSource.query(
      `INSERT INTO routes (name, label, description, color, total_distance_km, stops, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE) RETURNING *`,
      [name, label || 'Korytarz Autobusowy', description || 'Nowa trasa w systemie', color || '#0EA5E9', totalDistanceKm, JSON.stringify(stops)]
    );
    this.publicInfoService.clearTimetableCache(); // Invalidate cache so clients see it immediately
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
    if (updateRouteDto.label !== undefined) {
      updates.push(`label = $${i++}`);
      values.push(updateRouteDto.label);
    }
    if (updateRouteDto.description !== undefined) {
      updates.push(`description = $${i++}`);
      values.push(updateRouteDto.description);
    }
    if (updateRouteDto.color !== undefined) {
      updates.push(`color = $${i++}`);
      values.push(updateRouteDto.color);
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
    this.publicInfoService.clearTimetableCache(); // Invalidate cache so clients see it immediately
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
    let start = startDate;
    let end = endDate;
    if (!start) {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0] + ' 00:00:00';
    }
    if (!end) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      end = d.toISOString().split('T')[0] + ' 23:59:59';
    }

    const summaryQuery = `
      SELECT 
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COUNT(DISTINCT r.id) as total_tickets
      FROM payments p
      JOIN reservations r ON p.reservation_id = r.id
      JOIN schedules s ON r.schedule_id = s.id
      WHERE p.status = 'Zakończona'
        AND s.departure_time >= $1::timestamp 
        AND s.departure_time <= $2::timestamp
    `;
    const summaryRes = await this.dataSource.query(summaryQuery, [start, end]);
    const totalRevenue = Number(summaryRes[0]?.total_revenue || 0);
    const totalTickets = Number(summaryRes[0]?.total_tickets || 0);

    const reservationsQuery = `
      SELECT COUNT(r.id) as total_reservations
      FROM reservations r
      JOIN schedules s ON r.schedule_id = s.id
      WHERE r.status != 'Anulowana'
        AND s.departure_time >= $1::timestamp 
        AND s.departure_time <= $2::timestamp
    `;
    const reservationsRes = await this.dataSource.query(reservationsQuery, [start, end]);
    const totalReservations = Number(reservationsRes[0]?.total_reservations || 0);

    const routeRevenueQuery = `
      SELECT 
        ro.name as route_name,
        COALESCE(SUM(p.amount), 0) as revenue
      FROM routes ro
      JOIN schedules s ON s.route_id = ro.id
      JOIN reservations r ON r.schedule_id = s.id
      JOIN payments p ON p.reservation_id = r.id
      WHERE p.status = 'Zakończona'
        AND s.departure_time >= $1::timestamp 
        AND s.departure_time <= $2::timestamp
      GROUP BY ro.id, ro.name
      ORDER BY revenue DESC
    `;
    const routeRevenueRes = await this.dataSource.query(routeRevenueQuery, [start, end]);
    const revenueByRoute = routeRevenueRes.map((row: any) => ({
      routeName: row.route_name,
      revenue: Number(row.revenue)
    }));

    const dateRevenueQuery = `
      SELECT 
        TO_CHAR(p.created_at, 'YYYY-MM-DD') as date,
        COALESCE(SUM(p.amount), 0) as revenue
      FROM payments p
      JOIN reservations r ON p.reservation_id = r.id
      JOIN schedules s ON r.schedule_id = s.id
      WHERE p.status = 'Zakończona'
        AND s.departure_time >= $1::timestamp 
        AND s.departure_time <= $2::timestamp
      GROUP BY TO_CHAR(p.created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;
    const dateRevenueRes = await this.dataSource.query(dateRevenueQuery, [start, end]);
    const revenueByDate = dateRevenueRes.map((row: any) => ({
      date: row.date,
      revenue: Number(row.revenue)
    }));

    return {
      totalRevenue,
      totalTickets,
      totalReservations,
      revenueByRoute,
      revenueByDate
    };
  }

  async getFuelAndCourseAnalytics(startDate: string, endDate: string) {
    let start = startDate;
    let end = endDate;
    if (!start) {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0] + ' 00:00:00';
    }
    if (!end) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      end = d.toISOString().split('T')[0] + ' 23:59:59';
    }

    const query = `
      SELECT 
        r.name as route_name,
        COALESCE(SUM(rr.distance_km), 0) as total_distance,
        COALESCE(SUM(rr.fuel_liters), 0) as total_fuel
      FROM route_reports rr
      JOIN schedules s ON rr.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      WHERE rr.status = 'Zatwierdzony'
        AND s.departure_time >= $1::timestamp 
        AND s.departure_time <= $2::timestamp
      GROUP BY r.id, r.name
    `;
    const rows = await this.dataSource.query(query, [start, end]);

    let totalDistance = 0;
    let totalFuelUsed = 0;
    const efficiencyByRoute = rows.map((row: any) => {
      const dist = Number(row.total_distance);
      const fuel = Number(row.total_fuel);
      totalDistance += dist;
      totalFuelUsed += fuel;
      const consumption = dist > 0 ? (fuel / dist) * 100 : 0;
      return {
        routeName: row.route_name,
        totalDistance: dist,
        totalFuel: fuel,
        consumptionPer100km: Number(consumption.toFixed(2))
      };
    });

    const avgFuelConsumption = totalDistance > 0 ? (totalFuelUsed / totalDistance) * 100 : 0;

    return {
      totalDistance,
      totalFuelUsed,
      avgFuelConsumption: Number(avgFuelConsumption.toFixed(2)),
      efficiencyByRoute
    };
  }

  async getSystemLogs() {
    return this.dataSource.query(`
      SELECT 
        l.id,
        l.action_type,
        l.target_entity,
        l.payload,
        l.created_at,
        u.email as user_email,
        u.first_name || ' ' || u.last_name as user_name
      FROM system_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `);
  }

  async getPricingPolicies() {
    return this.dataSource.query('SELECT * FROM pricing_policies ORDER BY created_at DESC');
  }

  async getBuses() {
    return this.dataSource.query('SELECT * FROM buses ORDER BY registration_number');
  }

  async deleteUser(userId: string) {
    const scheduleCheck = await this.dataSource.query(
      'SELECT id FROM schedules WHERE driver_id = $1 LIMIT 1',
      [userId]
    );
    if (scheduleCheck.length > 0) {
      throw new ConflictException('Nie można usunąć użytkownika, ponieważ jest przypisany do zaplanowanych kursów jako kierowca.');
    }

    await this.dataSource.query('DELETE FROM users WHERE id = $1', [userId]);
    return { message: 'Użytkownik został usunięty.' };
  }
}
