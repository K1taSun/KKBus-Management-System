import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReservationsService {
  constructor(private dataSource: DataSource) {}

  async bookSeat(userId: string, body: any) {
    const { schedule_id, seat_number } = body;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // Blokada za no-show
      const userRes = await queryRunner.query(
        `SELECT no_shows FROM users WHERE id = $1`, [userId]
      );
      if (userRes[0]?.no_shows >= 3) {
        throw new BadRequestException('Konto zablokowane z powodu 3 niezrealizowanych rezerwacji.');
      }

      // Sprawdzenie kursu i czasu (min. 2h)
      const scheduleRes = await queryRunner.query(
        `SELECT s.id, b.capacity, s.departure_time 
         FROM schedules s
         JOIN buses b ON s.bus_id = b.id
         WHERE s.id = $1 FOR UPDATE`,
        [schedule_id]
      );

      if (scheduleRes.length === 0) {
        throw new BadRequestException('Taki kurs u nas nie widnieje.');
      }

      const { capacity, departure_time } = scheduleRes[0];
      const hoursUntilDeparture = (new Date(departure_time).getTime() - Date.now()) / (1000 * 60 * 60);

      if (hoursUntilDeparture < 2) {
        throw new BadRequestException('Rezerwacja jest możliwa najpóźniej na 2 godziny przed odjazdem.');
      }

      if (seat_number < 1 || seat_number > capacity) {
        throw new BadRequestException(`Autobus ma tylko ${capacity} miejsc!`);
      }

      // Zapis rezerwacji (blokada pesymistyczna)
      const resResult = await queryRunner.query(
        `INSERT INTO reservations (schedule_id, user_id, seat_number, status) 
         VALUES ($1, $2, $3, 'Potwierdzona') RETURNING id`,
        [schedule_id, userId, seat_number]
      );

      await queryRunner.commitTransaction();
      return { message: 'Rezerwacja potwierdzona.', reservationId: resResult[0].id };

    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
        throw new BadRequestException('Wybrane miejsce jest już zajęte. Wybierz inne.');
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelReservation(userId: string, reservationId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Sprawdzenie czasu (min. 24h na anulację)
      const sched = await queryRunner.query(
        `SELECT s.departure_time 
         FROM reservations res
         JOIN schedules s ON res.schedule_id = s.id
         WHERE res.id = $1 AND res.user_id = $2 AND res.status = 'Potwierdzona'`,
        [reservationId, userId]
      );

      if (sched.length === 0) {
        throw new BadRequestException('Rezerwacja nie istnieje lub jest już anulowana.');
      }

      const hoursUntilDeparture = (new Date(sched[0].departure_time).getTime() - Date.now()) / (1000 * 60 * 60);

      if (hoursUntilDeparture < 24) {
        throw new BadRequestException('Anulowanie rezerwacji jest możliwe najpóźniej na 24 godziny przed odjazdem.');
      }

      // 2. Anulujemy bilet
      await queryRunner.query(
        `UPDATE reservations SET status = 'Anulowana' 
         WHERE id = $1`,
        [reservationId]
      );

      await queryRunner.commitTransaction();
      return { message: 'Rezerwacja została pomyślnie anulowana.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
