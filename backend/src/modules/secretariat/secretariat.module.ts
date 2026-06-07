import { Module } from '@nestjs/common';
import { SecretariatController } from './secretariat.controller';
import { SecretariatService } from './secretariat.service';

@Module({
  controllers: [SecretariatController],
  providers: [SecretariatService],
})
export class SecretariatModule {}
