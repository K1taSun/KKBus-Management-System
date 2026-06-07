import { Controller, Get } from '@nestjs/common';
import { PublicInfoService } from './public-info.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('public-info')
export class PublicInfoController {
  constructor(private readonly publicInfoService: PublicInfoService) {}

  @Public()
  @Get('timetable')
  async getTimetable() {
    return this.publicInfoService.getRoutesAndTimetable();
  }

  @Public()
  @Get('pricing')
  async getPricing() {
    return this.publicInfoService.getPricingAndDiscounts();
  }
}
