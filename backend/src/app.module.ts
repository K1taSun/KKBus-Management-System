import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { PublicInfoModule } from './modules/public-info/public-info.module';
import { DriverModule } from './modules/driver/driver.module';
import { SecretariatModule } from './modules/secretariat/secretariat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'kkbus_user',
      password: process.env.DB_PASSWORD || 'kkbus_pass',
      database: process.env.DB_NAME || 'kkbus_db',
      autoLoadEntities: true,
      synchronize: false, // Database schema managed via SQL migration scripts
    }),
    AuthModule,
    ReservationsModule,
    SchedulesModule,
    ReportsModule,
    LoyaltyModule,
    PublicInfoModule,
    DriverModule,
    SecretariatModule,
  ],
})
export class AppModule {}
