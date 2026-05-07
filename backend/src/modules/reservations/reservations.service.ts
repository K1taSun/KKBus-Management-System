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
      // 1. Sprawdzamy czy kurs w ogóle istnieje i pobieramy dystans do punktów
      const scheduleRes = await queryRunner.query(
        `SELECT s.id, b.capacity, r.total_distance_km 
         FROM schedules s
         JOIN buses b ON s.bus_id = b.id
         JOIN routes r ON s.route_id = r.id
         WHERE s.id = $1 FOR UPDATE`,
        [schedule_id]
      );

      if (scheduleRes.length === 0) {
        throw new BadRequestException('Taki kurs u nas nie widnieje.');
      }

      const { capacity, total_distance_km } = scheduleRes[0];

      if (seat_number < 1 || seat_number > capacity) {
        throw new BadRequestException(`Autobus ma tylko ${capacity} miejsc!`);
      }

      // 2. Wbijamy rezerwację (baza wywali błąd unique constraint jeśli miejsce zajęte)
      const resResult = await queryRunner.query(
        `INSERT INTO reservations (schedule_id, user_id, seat_number, status) 
         VALUES ($1, $2, $3, 'Potwierdzona') RETURNING id`,
        [schedule_id, userId, seat_number]
      );

      // 3. Dodajemy punkty lojalnościowe w gratisie (1 km = 1 pkt)
      await queryRunner.query(
        `UPDATE loyalty_points 
         SET points_balance = points_balance + $1, last_transaction_date = CURRENT_TIMESTAMP 
         WHERE user_id = $2`,
        [total_distance_km, userId]
      );

      await queryRunner.commitTransaction();
      return { message: 'Rezerwacja potwierdzona i punkty lojalnościowe naliczone.', reservationId: resResult[0].id };

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
      // 1. Sprawdzamy, na jaki dystans była to rezerwacja, żeby wiedzieć ile punktów odebrać
      const sched = await queryRunner.query(
        `SELECT r.total_distance_km 
         FROM reservations res
         JOIN schedules s ON res.schedule_id = s.id
         JOIN routes r ON s.route_id = r.id
         WHERE res.id = $1 AND res.user_id = $2 AND res.status = 'Potwierdzona'`,
        [reservationId, userId]
      );

      if (sched.length === 0) {
        throw new BadRequestException('Rezerwacja nie istnieje lub jest już anulowana.');
      }

      const pointsToRemove = sched[0].total_distance_km;

      // 2. Anulujemy bilet
      await queryRunner.query(
        `UPDATE reservations SET status = 'Anulowana' 
         WHERE id = $1 RETURNING id`,
        [reservationId]
      );

      // 3. Odejmujemy cwaniackie punkty (zapobiegamy exploitowi na punkty lojalnościowe)
      await queryRunner.query(
        `UPDATE loyalty_points 
         SET points_balance = GREATEST(points_balance - $1, 0), last_transaction_date = CURRENT_TIMESTAMP 
         WHERE user_id = $2`,
        [pointsToRemove, userId]
      );

      await queryRunner.commitTransaction();
      return { message: 'Rezerwacja anulowana. Punkty lojalnościowe odjęte.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
