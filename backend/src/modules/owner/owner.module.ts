import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { PublicInfoModule } from '../public-info/public-info.module';

@Module({
  imports: [PublicInfoModule],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
