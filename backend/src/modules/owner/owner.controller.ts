import { Controller, Get, Post, Patch, Put, Body, Param, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { CreateUserDto, ChangeUserStatusDto, CreateRouteDto, UpdateRouteDto, OverrideScheduleDto, CreatePricingPolicyDto } from './dto/owner.dto';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Właściciel') // Highest privilege
@UseInterceptors(AuditLogInterceptor) // Centralized administrative auditing
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  // 1. Global User & Role Management
  @Get('users')
  async getUsers() {
    return this.ownerService.getUsers();
  }

  @Post('users')
  async createUser(@Body() dto: CreateUserDto) {
    return this.ownerService.createUser(dto);
  }

  @Patch('users/:id/status')
  async changeUserStatus(@Param('id') id: string, @Body() dto: ChangeUserStatusDto) {
    return this.ownerService.changeUserStatus(id, dto);
  }

  @Patch('users/:id/password')
  async overrideUserPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.ownerService.overrideUserPassword(id, password);
  }

  // 2. Route & Course Orchestration
  @Get('routes')
  async getRoutes() {
    return this.ownerService.getRoutes();
  }

  @Post('routes')
  async createRoute(@Body() dto: CreateRouteDto) {
    return this.ownerService.createRoute(dto);
  }
  @Put('routes/:id')
  async updateRoute(@Param('id') id: number, @Body() dto: UpdateRouteDto) {
    return this.ownerService.updateRoute(id, dto);
  }

  @Patch('routes/:id/deactivate')
  async deactivateRoute(@Param('id') id: number) {
    return this.ownerService.deactivateRoute(id);
  }

  // 3. Global Schedule Oversight
  @Get('schedules')
  async getSchedules(@Query('date') date?: string) {
    return this.ownerService.getSchedules(date);
  }

  @Patch('schedules/:id/override')
  async overrideSchedule(@Param('id') id: number, @Body() dto: OverrideScheduleDto) {
    return this.ownerService.overrideSchedule(id, dto);
  }

  // 4. Financial Policy & Loyalty Configuration
  @Post('pricing-policies')
  async createPricingPolicy(@Body() dto: CreatePricingPolicyDto) {
    return this.ownerService.createPricingPolicy(dto);
  }

  // 5. Advanced Analytics & Reporting
  @Get('analytics/financial')
  async getFinancialAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.ownerService.getFinancialAnalytics(startDate, endDate);
  }

  @Get('analytics/fuel')
  async getFuelAndCourseAnalytics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.ownerService.getFuelAndCourseAnalytics(startDate, endDate);
  }
}
