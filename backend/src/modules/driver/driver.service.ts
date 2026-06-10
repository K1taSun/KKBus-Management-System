import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SubmitReportDto, SetAvailabilityDto, SubmitInspectionDto, SubmitDefectDto, SubmitSOSDto } from './dto/driver.dto';

@Injectable()
export class DriverService {
  constructor(private dataSource: DataSource) {}

  async getSchedulesForDriver(driverId: string) {
    return this.dataSource.query(
      `SELECT s.id, s.departure_time, s.arrival_time, r.name as route_name, r.stops, b.registration_number
       FROM schedules s
       JOIN routes r ON s.route_id = r.id
       JOIN buses b ON s.bus_id = b.id
       WHERE s.driver_id = $1
       ORDER BY s.departure_time ASC`,
      [driverId]
    );
  }

  async getPassengerManifest(driverId: string, scheduleId: number) {
    // 1. Verify this driver is assigned to this schedule
    const scheduleCheck = await this.dataSource.query(
      `SELECT id FROM schedules WHERE id = $1 AND driver_id = $2`,
      [scheduleId, driverId]
    );

    if (!scheduleCheck.length) {
      throw new BadRequestException('You are not assigned to this schedule.');
    }

    // 2. Fetch manifest
    const manifest = await this.dataSource.query(
      `SELECT res.seat_number, u.first_name, u.last_name, u.phone, res.status
       FROM reservations res
       JOIN users u ON res.user_id = u.id
       WHERE res.schedule_id = $1 AND res.status != 'Anulowana'
       ORDER BY res.seat_number ASC`,
      [scheduleId]
    );

    if (!manifest.length) {
      throw new NotFoundException('No passengers found for this schedule.');
    }

    return {
      scheduleId,
      totalPassengers: manifest.length,
      passengers: manifest,
    };
  }

  async submitPostTripReport(driverId: string, dto: SubmitReportDto) {
    const { scheduleId, fuelLiters, fuelCost, distanceKm, presentUserIds, absentUserIds } = dto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Validate schedule belongs to this driver
      const scheduleCheck = await queryRunner.query(
        `SELECT id FROM schedules WHERE id = $1 AND driver_id = $2`,
        [scheduleId, driverId]
      );
      if (!scheduleCheck.length) {
        throw new BadRequestException('You are not assigned to this schedule.');
      }

      // 1b. Validate passenger lists against reservations on this schedule
      const passengerCheck = await queryRunner.query(
        `SELECT user_id FROM reservations WHERE schedule_id = $1 AND status != 'Anulowana'`,
        [scheduleId]
      );
      const validPassengerIds = new Set(passengerCheck.map((r: any) => r.user_id));

      for (const id of presentUserIds) {
        if (!validPassengerIds.has(id)) {
          throw new BadRequestException(`Użytkownik o ID ${id} nie posiada rezerwacji na ten kurs.`);
        }
      }
      for (const id of absentUserIds) {
        if (!validPassengerIds.has(id)) {
          throw new BadRequestException(`Użytkownik o ID ${id} nie posiada rezerwacji na ten kurs.`);
        }
      }

      // 2. Business Math: Calculate average fuel consumption per km (cost / total mileage)
      const averageFuelConsumption = distanceKm > 0 ? (fuelCost / distanceKm) : 0;
      const totalPassengers = presentUserIds.length;

      // 3. Save Report
      await queryRunner.query(
        `INSERT INTO route_reports (schedule_id, actual_passengers, fuel_liters, fuel_cost, distance_km, average_fuel_consumption, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Zatwierdzony')`,
        [scheduleId, totalPassengers, fuelLiters, fuelCost, distanceKm, averageFuelConsumption]
      );

      // 4. Update Loyalty Points and insert transaction logs
      if (presentUserIds.length > 0) {
        const pointsToAdd = Math.round(distanceKm);
        if (pointsToAdd > 0) {
          // Update points balance
          await queryRunner.query(
            `UPDATE loyalty_points 
             SET points_balance = points_balance + $1, last_transaction_date = CURRENT_TIMESTAMP 
             WHERE user_id = ANY($2::uuid[])`,
            [pointsToAdd, presentUserIds]
          );

          // Insert transactions for each present passenger
          for (const passengerId of presentUserIds) {
            await queryRunner.query(
              `INSERT INTO loyalty_transactions (user_id, points_delta, description)
               VALUES ($1, $2, $3)`,
              [
                passengerId,
                pointsToAdd,
                `Punkty naliczone za przejazd trasą o długości ${distanceKm} km.`,
              ]
            );
          }
        }
      }

      // 5. Update No-Shows
      if (absentUserIds.length > 0) {
        await queryRunner.query(
          `UPDATE users 
           SET no_shows = no_shows + 1 
           WHERE id = ANY($1::uuid[])`,
          [absentUserIds]
        );
      }

      await queryRunner.commitTransaction();
      return { 
        message: 'Report submitted successfully.', 
        metrics: { 
          averageFuelConsumption: averageFuelConsumption.toFixed(2),
          totalFuelCost: fuelCost
        } 
      };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
        throw new ConflictException('Report for this schedule already exists.');
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async setAvailability(driverId: string, dto: SetAvailabilityDto) {
    const { availableDate, status } = dto;
    
    // 1. Temporal restriction
    const targetDateStr = availableDate.split('T')[0];
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (targetDateStr <= todayStr) {
      throw new BadRequestException('Availability can only be set for future dates.');
    }

    // 2. Conflict resolution
    if (status === 'Niedostępny') {
      const scheduleConflict = await this.dataSource.query(
        `SELECT id FROM schedules WHERE driver_id = $1 AND DATE(departure_time) = $2 LIMIT 1`,
        [driverId, availableDate]
      );
      if (scheduleConflict.length > 0) {
        throw new ConflictException('Driver is already assigned to a schedule on this date.');
      }
    }

    // Upsert availability
    await this.dataSource.query(
      `INSERT INTO driver_availability (driver_id, available_date, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (driver_id, available_date) 
       DO UPDATE SET status = EXCLUDED.status, created_at = CURRENT_TIMESTAMP`,
      [driverId, availableDate, status]
    );

    return { message: 'Availability updated successfully.' };
  }

  async getAvailability(driverId: string) {
    return this.dataSource.query(
      `SELECT available_date, status, created_at 
       FROM driver_availability 
       WHERE driver_id = $1 
       ORDER BY available_date ASC`,
      [driverId]
    );
  }

  async deleteAvailability(driverId: string, date: string) {
    if (!date) {
      throw new BadRequestException('Date parameter is required');
    }
    
    await this.dataSource.query(
      `DELETE FROM driver_availability 
       WHERE driver_id = $1 AND available_date = $2`,
      [driverId, date]
    );

    return { message: 'Availability deleted successfully.' };
  }

  async generateManifestPdf(driverId: string, scheduleId: number): Promise<{ buffer: Buffer; filename: string }> {
    const manifest = await this.getPassengerManifest(driverId, scheduleId);

    const PdfPrinter = require('pdfmake');

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
      },
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      defaultStyle: { font: 'Helvetica', fontSize: 12 },
      content: [
        { text: `Lista pasażerów - Kurs #${scheduleId}`, style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: [
              // Telefon usunięty — dane osobowe niepotrzebne kierowcy (RODO)
              ['Nr Miejsca', 'Imię i nazwisko', 'Status'],
              ...manifest.passengers.map((row: any) => [
                row.seat_number.toString(),
                `${row.first_name} ${row.last_name}`,
                row.status,
              ]),
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
      },
    };

    // Zbieramy chunki do Buffera — wywołanie .end() po podpięciu konsumenta
    // eliminuje problem pustego PDF przy użyciu StreamableFile.
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    return {
      buffer,
      filename: `manifest_kurs_${scheduleId}.pdf`,
    };
  }

  async submitInspection(driverId: string, dto: SubmitInspectionDto) {
    await this.dataSource.query(
      `INSERT INTO vehicle_inspections (
         schedule_id, driver_id, bus_id, type, mileage, fuel_level, 
         lights_ok, tires_ok, interior_ok, fluids_ok, emergency_equipment_ok, keys_returned, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        dto.scheduleId || null,
        driverId,
        dto.busId,
        dto.type,
        dto.mileage,
        dto.fuelLevel,
        dto.lightsOk ?? true,
        dto.tiresOk ?? true,
        dto.interiorOk ?? true,
        dto.fluidsOk ?? true,
        dto.emergencyEquipmentOk ?? true,
        dto.keysReturned ?? null,
        dto.notes || null
      ]
    );
    return { message: 'Inspection submitted successfully.' };
  }

  async submitDefect(driverId: string, dto: SubmitDefectDto, photoUrl?: string) {
    await this.dataSource.query(
      `INSERT INTO vehicle_defects (bus_id, driver_id, schedule_id, severity, description, photo_url)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        dto.busId,
        driverId,
        dto.scheduleId || null,
        dto.severity,
        dto.description,
        photoUrl || null
      ]
    );
    return { message: 'Defect reported successfully.' };
  }

  async triggerSOS(driverId: string, dto: SubmitSOSDto) {
    await this.dataSource.query(
      `INSERT INTO sos_alerts (driver_id, schedule_id, bus_id, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        driverId,
        dto.scheduleId || null,
        dto.busId,
        dto.latitude,
        dto.longitude
      ]
    );
    return { message: 'SOS alert triggered.' };
  }

  async getVehicleDocuments(busId: number) {
    return this.dataSource.query(
      `SELECT doc_type, expiry_date, document_url 
       FROM vehicle_documents 
       WHERE bus_id = $1`,
      [busId]
    );
  }
}
