import { Module } from '@nestjs/common';
import { SecretariatController } from './secretariat.controller';
import { SecretariatService } from './secretariat.service';

import { PublicInfoModule } from '../public-info/public-info.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [PublicInfoModule, ReservationsModule],
  controllers: [SecretariatController],
  providers: [SecretariatService],
})
export class SecretariatModule {}
