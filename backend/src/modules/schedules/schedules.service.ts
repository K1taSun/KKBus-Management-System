import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SchedulesService {
  constructor(private dataSource: DataSource) {}

  async findAll(query: { from?: string; to?: string; date?: string }) {
    const { from, to, date } = query;

    let sql = `
      SELECT
        s.id,
        r.name        AS route_name,
        r.total_distance_km,
        s.departure_time,
        s.arrival_time,
        s.price_base,
        b.model       AS bus_model,
        b.capacity,
        (b.capacity - COUNT(res.id)) AS available_seats
      FROM schedules s
      JOIN routes r  ON s.route_id = r.id
      JOIN buses b   ON s.bus_id   = b.id
      LEFT JOIN reservations res
             ON res.schedule_id = s.id AND res.status != 'Anulowana'
      WHERE 1=1
    `;

    const params: any[] = [];

    if (from) {
      params.push(`%${from}%`);
      sql += ` AND r.name ILIKE $${params.length}`;
    }

    if (to) {
      params.push(`%${to}%`);
      sql += ` AND r.name ILIKE $${params.length}`;
    }

    if (date) {
      params.push(date);
      sql += ` AND DATE(s.departure_time) = $${params.length}`;
    }

    sql += `
      GROUP BY s.id, r.name, r.total_distance_km, s.departure_time,
               s.arrival_time, s.price_base, b.model, b.capacity
      ORDER BY s.departure_time ASC
    `;

    return this.dataSource.query(sql, params);
  }

  async findOne(id: number) {
    const result = await this.dataSource.query(
      `SELECT
         s.id,
         r.name        AS route_name,
         r.total_distance_km,
         s.departure_time,
         s.arrival_time,
         s.price_base,
         b.model       AS bus_model,
         b.capacity,
         (b.capacity - COUNT(res.id)) AS available_seats,
         ARRAY_AGG(res.seat_number)   AS booked_seats
       FROM schedules s
       JOIN routes r  ON s.route_id = r.id
       JOIN buses b   ON s.bus_id   = b.id
       LEFT JOIN reservations res
              ON res.schedule_id = s.id AND res.status != 'Anulowana'
       WHERE s.id = $1
       GROUP BY s.id, r.name, r.total_distance_km, s.departure_time,
                s.arrival_time, s.price_base, b.model, b.capacity`,
      [id],
    );

    if (result.length === 0) {
      throw new NotFoundException(`Kurs o id=${id} nie istnieje.`);
    }

    return result[0];
  }
}
