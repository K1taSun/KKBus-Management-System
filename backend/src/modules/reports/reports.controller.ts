import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@UseGuards(AuthGuard('jwt'))
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
// Dodałbym blokadę tylko dla "Właściciela", ale na razie wszyscy w firmie mogą to oglądać.
