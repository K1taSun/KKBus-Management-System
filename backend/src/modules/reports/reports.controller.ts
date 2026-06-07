import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Właściciel', 'Sekretariat')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('popularity')
  async getPopularity() {
    return this.reportsService.getRoutePopularity();
  }

  @Get('finance')
  async getFinancials() {
    return this.reportsService.getFinancialEstimate();
  }
}
