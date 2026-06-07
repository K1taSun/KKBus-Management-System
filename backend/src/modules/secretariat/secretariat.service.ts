import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { AssignFleetDto } from './dto/assign-fleet.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
const PdfPrinter = require('pdfmake');

@Injectable()
export class SecretariatService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://admin:admin123@localhost:5432/kkbus',
    });
  }

  async createClient(dto: CreateClientDto) {
    const { firstName, lastName, dateOfBirth, email, phone, loyaltyOptIn } = dto;

    // Check if email exists
    const emailCheck = await this.pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      throw new ConflictException('Email already exists');
    }

    // Get 'Klient' role id
    const roleRes = await this.pool.query("SELECT id FROM roles WHERE name = 'Klient'");
    const roleId = roleRes.rows[0].id;

    // Generate Client Number
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const clientNumber = `KKB-${yearMonth}-${rand}`;

    // Temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [email, passwordHash, firstName, lastName, phone || null, roleId]
      );
      const userId = userRes.rows[0].id;

      await client.query(
        `INSERT INTO client_profiles (user_id, date_of_birth, client_number, loyalty_opt_in)
         VALUES ($1, $2, $3, $4)`,
        [userId, dateOfBirth, clientNumber, loyaltyOptIn || false]
      );

      if (loyaltyOptIn) {
        await client.query(
          `INSERT INTO loyalty_points (user_id, points_balance) VALUES ($1, 0)`,
          [userId]
        );
      }

      await client.query('COMMIT');

      // TODO: Log or send email here
      console.log(`Email dispatched to ${email}. Temp Password: ${tempPassword}`);

      return {
        message: 'Client created successfully',
        clientNumber,
        tempPassword,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async createSchedule(dto: CreateScheduleDto) {
    const { routeId, busId, driverId, departureTime, arrivalTime, priceBase } = dto;
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    if (departure < new Date()) {
      throw new BadRequestException('Schedule modifications are strictly allowed for future dates only.');
    }

    if (arrival <= departure) {
      throw new BadRequestException('Arrival time must be after departure time.');
    }

    // Check Driver Overlaps
    const driverConflict = await this.pool.query(
      `SELECT id FROM schedules 
       WHERE driver_id = $1 
         AND (
           (departure_time < $3 AND arrival_time > $2)
         )`,
      [driverId, departure, arrival]
    );

    if (driverConflict.rows.length > 0) {
      throw new ConflictException('Driver is already booked for another route during this time.');
    }

    // Check Bus Overlaps and Status (Fleet & Route Assignment requirement)
    const busCheck = await this.pool.query('SELECT status FROM buses WHERE id = $1', [busId]);
    if (busCheck.rows.length === 0) {
      throw new BadRequestException('Bus not found');
    }
    if (busCheck.rows[0].status === 'W serwisie' || busCheck.rows[0].status === 'Złom') {
      throw new ConflictException('Vehicle is not available for assignment (in repair or scrapped).');
    }

    const busConflict = await this.pool.query(
      `SELECT id FROM schedules 
       WHERE bus_id = $1 
         AND (
           (departure_time < $3 AND arrival_time > $2)
         )`,
      [busId, departure, arrival]
    );

    if (busConflict.rows.length > 0) {
      throw new ConflictException('Vehicle is already assigned to another overlapping course.');
    }

    // Insert schedule
    const res = await this.pool.query(
      `INSERT INTO schedules (route_id, bus_id, driver_id, departure_time, arrival_time, price_base)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [routeId, busId, driverId, departure, arrival, priceBase]
    );

    return {
      message: 'Schedule created successfully',
      scheduleId: res.rows[0].id,
    };
  }

  async assignFleet(scheduleId: number, dto: AssignFleetDto) {
    const { busId } = dto;

    const scheduleCheck = await this.pool.query('SELECT departure_time, arrival_time FROM schedules WHERE id = $1', [scheduleId]);
    if (scheduleCheck.rows.length === 0) {
      throw new BadRequestException('Schedule not found');
    }

    const { departure_time, arrival_time } = scheduleCheck.rows[0];

    // Check Bus Status
    const busCheck = await this.pool.query('SELECT status FROM buses WHERE id = $1', [busId]);
    if (busCheck.rows.length === 0) {
      throw new BadRequestException('Bus not found');
    }
    if (busCheck.rows[0].status === 'W serwisie' || busCheck.rows[0].status === 'Złom') {
      throw new ConflictException('Vehicle is not available for assignment (in repair or scrapped).');
    }

    // Check Bus Overlaps
    const busConflict = await this.pool.query(
      `SELECT id FROM schedules 
       WHERE bus_id = $1 
         AND id != $4
         AND (
           (departure_time < $3 AND arrival_time > $2)
         )`,
      [busId, departure_time, arrival_time, scheduleId]
    );

    if (busConflict.rows.length > 0) {
      throw new ConflictException('Vehicle is already assigned to another overlapping course.');
    }

    await this.pool.query('UPDATE schedules SET bus_id = $1 WHERE id = $2', [busId, scheduleId]);

    return {
      message: 'Fleet assigned successfully',
    };
  }

  async getDrivers() {
    const res = await this.pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'Kierowca'
    `);
    return res.rows;
  }

  async getRoutes() {
    const res = await this.pool.query('SELECT id, name, estimated_duration_minutes FROM routes ORDER BY id ASC');
    return res.rows;
  }

  async getBuses() {
    const res = await this.pool.query('SELECT id, plate_number, capacity, status FROM buses ORDER BY id ASC');
    return res.rows;
  }

  async getSchedules() {
    const res = await this.pool.query(`
      SELECT s.id, s.departure_time, s.arrival_time, s.price_base,
             r.name as route_name,
             b.plate_number as bus_plate,
             u.first_name as driver_first_name, u.last_name as driver_last_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      JOIN users u ON s.driver_id = u.id
      ORDER BY s.departure_time DESC
      LIMIT 100
    `);
    return res.rows;
  }

  async generateReport(startDate: string, endDate: string) {
    const res = await this.pool.query(`
      SELECT s.id, s.departure_time, s.arrival_time, 
             r.name as route_name,
             b.plate_number as bus_plate,
             u.first_name as driver_first_name, u.last_name as driver_last_name,
             (SELECT COUNT(*) FROM reservations rev WHERE rev.schedule_id = s.id) as passenger_count
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      JOIN users u ON s.driver_id = u.id
      WHERE s.departure_time >= $1 AND s.departure_time <= $2
      ORDER BY s.departure_time ASC
    `, [startDate, endDate]);

    const data = res.rows;

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const printer = new PdfPrinter(fonts);

    const tableBody = [
      ['Data odjazdu', 'Trasa', 'Kierowca', 'Autobus', 'Pasażerów']
    ];

    data.forEach(row => {
      tableBody.push([
        new Date(row.departure_time).toLocaleString('pl-PL'),
        row.route_name,
        `${row.driver_first_name} ${row.driver_last_name}`,
        row.bus_plate,
        row.passenger_count.toString()
      ]);
    });

    const docDefinition: TDocumentDefinitions = {
      defaultStyle: { font: 'Helvetica' },
      content: [
        { text: 'Raport Operacyjny KKBus', style: 'header' },
        { text: `Okres: ${startDate} do ${endDate}`, margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto'],
            body: tableBody
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    return pdfDoc;
  }

  async getDashboardMetrics() {
    const today = new Date().toISOString().split('T')[0];
    
    // Count schedules today
    const schedulesRes = await this.pool.query(
      `SELECT COUNT(*) FROM schedules WHERE DATE(departure_time) = $1`,
      [today]
    );

    // Count available buses
    const busesRes = await this.pool.query(
      `SELECT COUNT(*) FROM buses WHERE status = 'Dostępny' OR status = 'W trasie'`
    );

    // Count clients
    const clientsRes = await this.pool.query(
      `SELECT COUNT(*) FROM roles r JOIN users u ON u.role_id = r.id WHERE r.name = 'Klient'`
    );

    return {
      todaySchedules: parseInt(schedulesRes.rows[0].count, 10),
      activeBuses: parseInt(busesRes.rows[0].count, 10),
      totalClients: parseInt(clientsRes.rows[0].count, 10)
    };
  }

  async updateBusStatus(busId: number, status: string) {
    const validStatuses = ['Dostępny', 'W trasie', 'W serwisie', 'Złom'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    await this.pool.query('UPDATE buses SET status = $1 WHERE id = $2', [status, busId]);
    return { message: 'Bus status updated' };
  }
}
