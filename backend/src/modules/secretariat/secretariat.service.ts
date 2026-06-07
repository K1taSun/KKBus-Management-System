import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { AssignFleetDto } from './dto/assign-fleet.dto';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { PublicInfoService } from '../public-info/public-info.service';
import { ReservationsService } from '../reservations/reservations.service';
import { BookSeatsDto } from '../reservations/dto/book-seats.dto';
const PdfPrinter = require('pdfmake');

@Injectable()
export class SecretariatService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly publicInfoService: PublicInfoService,
    private readonly reservationsService: ReservationsService,
  ) {}

  async createClient(dto: CreateClientDto) {
    const { firstName, lastName, dateOfBirth, email, phone, loyaltyOptIn } = dto;

    // Check if email exists
    const emailCheck = await this.dataSource.query(
      'SELECT id FROM users WHERE email = $1',
      [email],
    );
    if (emailCheck.length > 0) {
      throw new ConflictException('Email already exists');
    }

    // Get 'Klient' role id
    const roleRes = await this.dataSource.query(
      "SELECT id FROM roles WHERE name = 'Klient'",
    );
    const roleId = roleRes[0].id;

    // Generate Client Number
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const clientNumber = `KKB-${yearMonth}-${rand}`;

    // Temp password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRes = await queryRunner.manager.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [email, passwordHash, firstName, lastName, phone || null, roleId],
      );
      const userId = userRes[0].id;

      await queryRunner.manager.query(
        `INSERT INTO client_profiles (user_id, date_of_birth, client_number, loyalty_opt_in)
         VALUES ($1, $2, $3, $4)`,
        [userId, dateOfBirth, clientNumber, loyaltyOptIn || false],
      );

      if (loyaltyOptIn) {
        await queryRunner.manager.query(
          `INSERT INTO loyalty_points (user_id, points_balance) VALUES ($1, 0)`,
          [userId],
        );
      }

      await queryRunner.commitTransaction();

      // TODO: Replace with a real email dispatch service (e.g. Nodemailer / SendGrid).
      // SECURITY: Never log tempPassword in production — remove this line and send via email.
      console.log(`[SMTP MOCK] Wysłano tymczasowe hasło do: ${email}`);

      return {
        message: 'Client created successfully',
        clientNumber,
        tempPassword,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
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
    const driverConflict = await this.dataSource.query(
      `SELECT id FROM schedules
       WHERE driver_id = $1
         AND (
           (departure_time < $3 AND arrival_time > $2)
         )`,
      [driverId, departure, arrival],
    );

    if (driverConflict.length > 0) {
      throw new ConflictException('Driver is already booked for another route during this time.');
    }

    // Check Bus Status
    const busCheck = await this.dataSource.query(
      'SELECT status FROM buses WHERE id = $1',
      [busId],
    );
    if (busCheck.length === 0) {
      throw new BadRequestException('Bus not found');
    }
    if (busCheck[0].status === 'W serwisie' || busCheck[0].status === 'Złom') {
      throw new ConflictException('Vehicle is not available for assignment (in repair or scrapped).');
    }

    // Check Bus Overlaps
    const busConflict = await this.dataSource.query(
      `SELECT id FROM schedules
       WHERE bus_id = $1
         AND (
           (departure_time < $3 AND arrival_time > $2)
         )`,
      [busId, departure, arrival],
    );

    if (busConflict.length > 0) {
      throw new ConflictException('Vehicle is already assigned to another overlapping course.');
    }

    // Insert schedule
    const res = await this.dataSource.query(
      `INSERT INTO schedules (route_id, bus_id, driver_id, departure_time, arrival_time, price_base)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [routeId, busId, driverId, departure, arrival, priceBase],
    );

    // Inwalidacja cache rozkładu jazdy
    this.publicInfoService.clearTimetableCache();

    return {
      message: 'Schedule created successfully',
      scheduleId: res[0].id,
    };
  }

  async assignFleet(scheduleId: number, dto: AssignFleetDto) {
    const { busId } = dto;

    const scheduleCheck = await this.dataSource.query(
      'SELECT departure_time, arrival_time FROM schedules WHERE id = $1',
      [scheduleId],
    );
    if (scheduleCheck.length === 0) {
      throw new BadRequestException('Schedule not found');
    }

    const { departure_time, arrival_time } = scheduleCheck[0];

    // Check Bus Status & Capacity
    const busCheck = await this.dataSource.query(
      'SELECT status, capacity FROM buses WHERE id = $1',
      [busId],
    );
    if (busCheck.length === 0) {
      throw new BadRequestException('Bus not found');
    }
    if (busCheck[0].status === 'W serwisie' || busCheck[0].status === 'Złom') {
      throw new ConflictException('Vehicle is not available for assignment (in repair or scrapped).');
    }

    // Check if new bus capacity is smaller than existing confirmed reservations
    const reservationsCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM reservations WHERE schedule_id = $1 AND status != 'Anulowana'`,
      [scheduleId]
    );
    const passengerCount = parseInt(reservationsCount[0].count, 10);
    const newCapacity = parseInt(busCheck[0].capacity, 10);
    if (passengerCount > newCapacity) {
      throw new ConflictException(
        `Nie można przypisać pojazdu. Liczba aktywnych rezerwacji (${passengerCount}) przekracza pojemność wybranego autobusu (${newCapacity}).`
      );
    }

    // Check Bus Overlaps (excluding the current schedule)
    const busConflict = await this.dataSource.query(
      `SELECT id FROM schedules
       WHERE bus_id = $1
         AND id != $4
         AND (
           (departure_time < $3 AND arrival_time > $2)
         )`,
      [busId, departure_time, arrival_time, scheduleId],
    );

    if (busConflict.length > 0) {
      throw new ConflictException('Vehicle is already assigned to another overlapping course.');
    }

    await this.dataSource.query(
      'UPDATE schedules SET bus_id = $1 WHERE id = $2',
      [busId, scheduleId],
    );

    // Inwalidacja cache rozkładu jazdy
    this.publicInfoService.clearTimetableCache();

    return {
      message: 'Fleet assigned successfully',
    };
  }

  async getDrivers() {
    return this.dataSource.query(`
      SELECT u.id, u.first_name, u.last_name, u.email
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'Kierowca'
    `);
  }

  async getRoutes() {
    return this.dataSource.query(
      'SELECT id, name, estimated_duration_minutes FROM routes ORDER BY id ASC',
    );
  }

  async getBuses() {
    return this.dataSource.query(
      'SELECT id, registration_number, capacity, status FROM buses ORDER BY id ASC',
    );
  }

  async getSchedules() {
    return this.dataSource.query(`
      SELECT s.id, s.departure_time, s.arrival_time, s.price_base,
             r.name as route_name,
             b.registration_number as bus_registration,
             u.first_name as driver_first_name, u.last_name as driver_last_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      JOIN users u ON s.driver_id = u.id
      ORDER BY s.departure_time DESC
      LIMIT 100
    `);
  }

  async generateReport(startDate: string, endDate: string) {
    const data = await this.dataSource.query(
      `SELECT s.id, s.departure_time, s.arrival_time,
              r.name as route_name,
              b.registration_number as bus_registration,
              u.first_name as driver_first_name, u.last_name as driver_last_name,
              COUNT(rev.id) as passenger_count
       FROM schedules s
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       JOIN users u ON s.driver_id = u.id
       LEFT JOIN reservations rev ON rev.schedule_id = s.id
       WHERE s.departure_time >= $1 AND s.departure_time <= $2
       GROUP BY s.id, r.name, b.registration_number, u.first_name, u.last_name
       ORDER BY s.departure_time ASC`,
      [startDate, endDate],
    );

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const printer = new PdfPrinter(fonts);

    const tableBody: string[][] = [
      ['Data odjazdu', 'Trasa', 'Kierowca', 'Autobus', 'Pasażerów'],
    ];

    data.forEach((row: any) => {
      tableBody.push([
        new Date(row.departure_time).toLocaleString('pl-PL'),
        row.route_name,
        `${row.driver_first_name} ${row.driver_last_name}`,
        row.bus_registration,
        row.passenger_count.toString(),
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
            body: tableBody,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    return pdfDoc;
  }

  async getDashboardMetrics() {
    const today = new Date().toISOString().split('T')[0];

    // Count schedules today
    const schedulesRes = await this.dataSource.query(
      `SELECT COUNT(*) FROM schedules WHERE DATE(departure_time) = $1`,
      [today],
    );

    // Count available buses
    const busesRes = await this.dataSource.query(
      `SELECT COUNT(*) FROM buses WHERE status = 'Dostępny' OR status = 'W trasie'`,
    );

    // Count clients
    const clientsRes = await this.dataSource.query(
      `SELECT COUNT(*) FROM roles r JOIN users u ON u.role_id = r.id WHERE r.name = 'Klient'`,
    );

    return {
      todaySchedules: parseInt(schedulesRes[0].count, 10),
      activeBuses: parseInt(busesRes[0].count, 10),
      totalClients: parseInt(clientsRes[0].count, 10),
    };
  }

  async updateBusStatus(busId: number, status: string) {
    const validStatuses = ['Dostępny', 'W trasie', 'W serwisie', 'Złom'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Nieprawidłowy status: "${status}". Dozwolone wartości: ${validStatuses.join(', ')}.`);
    }

    await this.dataSource.query(
      'UPDATE buses SET status = $1 WHERE id = $2',
      [status, busId],
    );
    return { message: 'Bus status updated' };
  }

  async bookOnBehalfOfClient(clientId: string, dto: BookSeatsDto) {
    return this.reservationsService.bookSeatsOnBehalf(clientId, dto);
  }
}
