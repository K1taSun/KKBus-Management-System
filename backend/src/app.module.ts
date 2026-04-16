import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'kkbus_user',
      password: process.env.DB_PASSWORD || 'kkbus_pass',
      database: process.env.DB_NAME || 'kkbus_db',
      autoLoadEntities: true,
      synchronize: false, // My użyliśmy skryptu SQL, nie pozwalamy TypeORM mieszać!
    }),
    AuthModule,
    ReservationsModule,
    ReportsModule,
  ],
})
export class AppModule {}
