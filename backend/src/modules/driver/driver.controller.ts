import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, StreamableFile, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DriverService } from './driver.service';
import { SubmitReportDto, SetAvailabilityDto, SubmitInspectionDto, SubmitDefectDto, SubmitSOSDto } from './dto/driver.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('driver')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Kierowca')
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get('schedules')
  async getMySchedules(@Request() req) {
    const driverId = req.user.userId; 
    return this.driverService.getSchedulesForDriver(driverId);
  }

  @Get('schedules/:scheduleId/manifest')
  async getPassengerManifest(@Request() req, @Param('scheduleId') scheduleId: string) {
    const driverId = req.user.userId;
    return this.driverService.getPassengerManifest(driverId, parseInt(scheduleId, 10));
  }

  @Get('schedules/:scheduleId/manifest/pdf')
  async getPassengerManifestPdf(@Request() req, @Param('scheduleId') scheduleId: string) {
    const driverId = req.user.userId;
    const { buffer, filename } = await this.driverService.generateManifestPdf(driverId, parseInt(scheduleId, 10));
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${filename}"`,
    });
  }

  @Post('reports')
  async submitReport(@Request() req, @Body() dto: SubmitReportDto) {
    const driverId = req.user.userId;
    return this.driverService.submitPostTripReport(driverId, dto);
  }

  @Post('availability')
  async setAvailability(@Request() req, @Body() dto: SetAvailabilityDto) {
    const driverId = req.user.userId;
    return this.driverService.setAvailability(driverId, dto);
  }

  @Get('availability')
  async getAvailability(@Request() req) {
    const driverId = req.user.userId;
    return this.driverService.getAvailability(driverId);
  }

  @Delete('availability')
  async deleteAvailability(@Request() req, @Query('date') date: string) {
    const driverId = req.user.userId;
    return this.driverService.deleteAvailability(driverId, date);
  }

  @Post('inspections')
  async submitInspection(@Request() req, @Body() dto: SubmitInspectionDto) {
    const driverId = req.user.userId;
    return this.driverService.submitInspection(driverId, dto);
  }

  @Post('defects')
  @UseInterceptors(FileInterceptor('photo', { dest: './uploads/defects' }))
  async submitDefect(
    @Request() req,
    @Body() dto: SubmitDefectDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const driverId = req.user.userId;
    const photoUrl = file ? `/uploads/defects/${file.filename}` : undefined;
    return this.driverService.submitDefect(driverId, dto, photoUrl);
  }

  @Post('sos')
  async triggerSOS(@Request() req, @Body() dto: SubmitSOSDto) {
    const driverId = req.user.userId;
    return this.driverService.triggerSOS(driverId, dto);
  }

  @Get('vehicles/:busId/documents')
  async getVehicleDocuments(@Param('busId') busId: string) {
    return this.driverService.getVehicleDocuments(parseInt(busId, 10));
  }
}
