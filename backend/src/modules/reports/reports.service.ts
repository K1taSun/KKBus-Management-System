import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

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
    const result = await this.dataSource.query(`
      SELECT r.name as "Trasa", SUM(s.price_base) as "Szacowany_Przychod"
      FROM routes r
      JOIN schedules s ON r.id = s.route_id
      JOIN reservations res ON s.id = res.schedule_id AND res.status = 'Potwierdzona'
      GROUP BY r.id, r.name
    `);

    return {
      title: "Szacunkowe Przychody",
      data: result
    };
  }
}
