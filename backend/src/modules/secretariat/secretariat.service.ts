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
const pdfmake = require('pdfmake');

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
      'SELECT id, name, total_distance_km as estimated_duration_minutes FROM routes ORDER BY id ASC',
    );
  }

  async getBuses() {
    return this.dataSource.query(`
      SELECT 
        id, 
        registration_number as plate_number, 
        model,
        capacity,
        CASE 
          WHEN status = 'W serwisie' THEN 'W serwisie'
          WHEN status = 'Złom' THEN 'Złom'
          WHEN EXISTS (
            SELECT 1 FROM schedules s 
            WHERE s.bus_id = buses.id 
              AND s.departure_time <= NOW() 
              AND s.arrival_time >= NOW()
          ) THEN 'W trasie'
          ELSE 'Dostępny'
        END as status
      FROM buses 
      ORDER BY id ASC
    `);
  }

  async getSchedules() {
    return this.dataSource.query(`
      SELECT s.id, s.departure_time, s.arrival_time, s.price_base,
             r.name as route_name,
             b.registration_number as bus_plate,
             u.first_name as driver_first_name, u.last_name as driver_last_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      JOIN users u ON s.driver_id = u.id
      ORDER BY s.departure_time DESC
      LIMIT 100
    `);
  }

  async getFutureSchedules() {
    return this.dataSource.query(`
      SELECT s.id, s.departure_time, s.arrival_time, s.price_base,
             r.name as route_name,
             b.registration_number as bus_plate,
             u.first_name as driver_first_name, u.last_name as driver_last_name
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN buses b ON s.bus_id = b.id
      JOIN users u ON s.driver_id = u.id
      WHERE s.departure_time >= NOW()
      ORDER BY s.departure_time ASC
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
       WHERE DATE(s.departure_time) >= $1 AND DATE(s.departure_time) <= $2
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

    pdfmake.setFonts(fonts);

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

    const pdfDoc = pdfmake.createPdf(docDefinition);
    return await pdfDoc.getBuffer();
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
      `SELECT COUNT(*) FROM buses WHERE status = 'Aktywny'`,
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
    const validStatuses = ['Dostępny', 'W trasie', 'W serwisie', 'Złom', 'Aktywny'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Nieprawidłowy status: "${status}". Dozwolone wartości: ${validStatuses.join(', ')}.`);
    }

    const dbStatus = (status === 'Dostępny' || status === 'W trasie' || status === 'Aktywny') ? 'Aktywny' : status;

    await this.dataSource.query(
      'UPDATE buses SET status = $1 WHERE id = $2',
      [dbStatus, busId],
    );
    return { message: 'Bus status updated' };
  }

  async bookOnBehalfOfClient(clientId: string, dto: BookSeatsDto) {
    return this.reservationsService.bookSeatsOnBehalf(clientId, dto);
  }

  async createBus(dto: { registrationNumber: string; model: string; capacity: number; status?: string }) {
    const { registrationNumber, model, capacity, status } = dto;
    if (!registrationNumber || !model || !capacity) {
      throw new BadRequestException('Brak wymaganych pól (numer rejestracyjny, model, pojemność).');
    }
    if (capacity <= 0) {
      throw new BadRequestException('Pojemność musi być większa od zera.');
    }

    const check = await this.dataSource.query(
      'SELECT id FROM buses WHERE registration_number = $1',
      [registrationNumber]
    );
    if (check.length > 0) {
      throw new ConflictException('Pojazd o tym numerze rejestracyjnym już istnieje.');
    }

    const dbStatus = (status === 'Dostępny' || status === 'W trasie' || status === 'Aktywny') ? 'Aktywny' : (status || 'Aktywny');

    const res = await this.dataSource.query(
      `INSERT INTO buses (registration_number, model, capacity, status)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [registrationNumber, model, capacity, dbStatus]
    );

    return {
      message: 'Bus created successfully',
      busId: res[0].id
    };
  }

  async updateBus(id: number, dto: { registrationNumber: string; model: string; capacity: number }) {
    const { registrationNumber, model, capacity } = dto;
    if (!registrationNumber || !model || !capacity) {
      throw new BadRequestException('Brak wymaganych pól.');
    }
    if (capacity <= 0) {
      throw new BadRequestException('Pojemność musi być większa od zera.');
    }

    const check = await this.dataSource.query(
      'SELECT id FROM buses WHERE registration_number = $1 AND id != $2',
      [registrationNumber, id]
    );
    if (check.length > 0) {
      throw new ConflictException('Pojazd o tym numerze rejestracyjnym już istnieje.');
    }

    const schedules = await this.dataSource.query(
      'SELECT id FROM schedules WHERE bus_id = $1',
      [id]
    );
    for (const s of schedules) {
      const reservationsCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM reservations WHERE schedule_id = $1 AND status != 'Anulowana'`,
        [s.id]
      );
      const passengerCount = parseInt(reservationsCount[0].count, 10);
      if (passengerCount > capacity) {
        throw new ConflictException(
          `Nie można zmniejszyć pojemności autobusu do ${capacity}, ponieważ kurs o ID ${s.id} posiada już ${passengerCount} aktywnych rezerwacji.`
        );
      }
    }

    await this.dataSource.query(
      `UPDATE buses 
       SET registration_number = $1, model = $2, capacity = $3
       WHERE id = $4`,
      [registrationNumber, model, capacity, id]
    );

    return { message: 'Bus updated successfully' };
  }

  async deleteBus(id: number) {
    const scheduleCheck = await this.dataSource.query(
      'SELECT id FROM schedules WHERE bus_id = $1 LIMIT 1',
      [id]
    );
    if (scheduleCheck.length > 0) {
      throw new ConflictException('Nie można usunąć pojazdu, ponieważ jest on przypisany do zaplanowanych kursów.');
    }

    await this.dataSource.query('DELETE FROM buses WHERE id = $1', [id]);
    return { message: 'Bus deleted successfully' };
  }

  async getClients() {
    return this.dataSource.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, cp.client_number
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN client_profiles cp ON cp.user_id = u.id
      WHERE r.name = 'Klient'
      ORDER BY u.last_name ASC, u.first_name ASC
    `);
  }
}
