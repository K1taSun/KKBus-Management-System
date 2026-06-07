import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

  async submitRouteReport(driverId: string, body: { scheduleId: number, fuelLiters: number, distanceKm: number, presentUserIds: string[], absentUserIds: string[] }) {
    const { scheduleId, fuelLiters, distanceKm, presentUserIds, absentUserIds } = body;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Zapis raportu z kursu
      const actualPassengers = presentUserIds.length;
      await queryRunner.query(
        `INSERT INTO route_reports (schedule_id, actual_passengers, fuel_liters, distance_km, status)
         VALUES ($1, $2, $3, $4, 'Zatwierdzony')`,
        [scheduleId, actualPassengers, fuelLiters, distanceKm]
      );

      // Przyznawanie punktów (1 km = 1 pkt)
      if (presentUserIds.length > 0) {
        // Wymaga użycia ANY($1::uuid[]) w zapytaniu do Postgresa
        await queryRunner.query(
          `UPDATE loyalty_points 
           SET points_balance = points_balance + $1, last_transaction_date = CURRENT_TIMESTAMP 
           WHERE user_id = ANY($2::uuid[])`,
          [distanceKm, presentUserIds]
        );
      }

      // Rejestracja nieobecności
      if (absentUserIds.length > 0) {
        await queryRunner.query(
          `UPDATE users 
           SET no_shows = no_shows + 1 
           WHERE id = ANY($1::uuid[])`,
          [absentUserIds]
        );
      }

      await queryRunner.commitTransaction();
      return { message: 'Raport z trasy zatwierdzony. Punkty lojalnościowe zostały rozdane.' };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      if (err.code === '23505') {
        throw new BadRequestException('Raport dla tego kursu został już złożony!');
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getRoutePopularity() {
    const result = await this.dataSource.query(`
      SELECT r.name as "Trasa", COUNT(res.id) as "Sprzedane_Bilety"
      FROM routes r
      LEFT JOIN schedules s ON r.id = s.route_id
      LEFT JOIN reservations res ON s.id = res.schedule_id AND res.status = 'Potwierdzona'
      GROUP BY r.id, r.name
      ORDER BY "Sprzedane_Bilety" DESC
    `);
    
    return {
      title: "Raport Popularności Tras",
      data: result
    };
  }

  async getFinancialEstimate() {
    // Każdy JOIN z rezerwacjami tworzy osobny wiersz per bilet.
    // SUM(s.price_base) sumuje cenę bazową raz na każdy sprzedany fotel — wynik jest poprawny.
    // COUNT(res.id) pokazuje liczbę sprzedanych biletów.
    const result = await this.dataSource.query(`
      SELECT
        r.name                    AS "Trasa",
        COUNT(res.id)             AS "Sprzedane_Bilety",
        SUM(s.price_base)         AS "Szacowany_Przychod"
      FROM routes r
      JOIN schedules s   ON r.id  = s.route_id
      JOIN reservations res
                         ON s.id  = res.schedule_id
                        AND res.status = 'Potwierdzona'
      GROUP BY r.id, r.name
      ORDER BY "Szacowany_Przychod" DESC
    `);

    return {
      title: "Szacunkowe Przychody",
      data: result
    };
  }
}
