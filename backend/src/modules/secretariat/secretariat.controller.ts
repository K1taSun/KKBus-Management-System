import { Controller, Post, Body, UseGuards, Patch, Param, Get, Res, StreamableFile, Query, Put, Delete } from '@nestjs/common';
import { Response } from 'express';
import { SecretariatService } from './secretariat.service';
import { CreateClientDto } from './dto/create-client.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { AssignFleetDto } from './dto/assign-fleet.dto';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

import { BookSeatsDto } from '../reservations/dto/book-seats.dto';

@Controller('secretariat')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Sekretariat')
export class SecretariatController {
  constructor(private readonly secretariatService: SecretariatService) {}

  @Get('dashboard')
  getDashboardMetrics() {
    return this.secretariatService.getDashboardMetrics();
  }

  @Get('drivers')
  getDrivers() {
    return this.secretariatService.getDrivers();
  }

  @Get('routes')
  getRoutes() {
    return this.secretariatService.getRoutes();
  }

  @Get('buses')
  getBuses() {
    return this.secretariatService.getBuses();
  }

  @Get('schedules')
  getSchedules() {
    return this.secretariatService.getSchedules();
  }

  @Post('clients')
  createClient(@Body() createClientDto: CreateClientDto) {
    return this.secretariatService.createClient(createClientDto);
  }

  @Post('schedules')
  createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    return this.secretariatService.createSchedule(createScheduleDto);
  }

  @Patch('schedules/:id/fleet')
  assignFleet(@Param('id') id: string, @Body() assignFleetDto: AssignFleetDto) {
    return this.secretariatService.assignFleet(+id, assignFleetDto);
  }

  @Get('reports')
  async getReports(@Query() query: GenerateReportDto, @Res({ passthrough: true }) res: Response) {
    const pdfBuffer: Buffer = await this.secretariatService.generateReport(query.startDate, query.endDate);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="raport.pdf"',
    });

    return new StreamableFile(pdfBuffer);
  }

  @Patch('buses/:id/status')
  updateBusStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.secretariatService.updateBusStatus(+id, status);
  }

  @Post('buses')
  createBus(@Body() dto: { registrationNumber: string; model: string; capacity: number; status?: string }) {
    return this.secretariatService.createBus(dto);
  }

  @Put('buses/:id')
  updateBus(
    @Param('id') id: string,
    @Body() dto: { registrationNumber: string; model: string; capacity: number }
  ) {
    return this.secretariatService.updateBus(+id, dto);
  }

  @Delete('buses/:id')
  deleteBus(@Param('id') id: string) {
    return this.secretariatService.deleteBus(+id);
  }

  @Get('clients')
  getClients() {
    return this.secretariatService.getClients();
  }

  @Post('reservations/behalf/:clientId')
  bookOnBehalfOfClient(@Param('clientId') clientId: string, @Body() dto: BookSeatsDto) {
    return this.secretariatService.bookOnBehalfOfClient(clientId, dto);
  }
}
