import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('route_reports')
export class RouteReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'schedule_id', type: 'int', unique: true })
  scheduleId: number;

  @Column({ name: 'actual_passengers', type: 'int' })
  actualPassengers: number;

  @Column({ name: 'fuel_liters', type: 'decimal', precision: 10, scale: 2 })
  fuelLiters: number;

  @Column({ name: 'distance_km', type: 'int' })
  distanceKm: number;

  @Column({ type: 'varchar', length: 50, default: 'Oczekujący' })
  status: string;

  @CreateDateColumn({ name: 'submitted_at' })
  submittedAt: Date;
}
