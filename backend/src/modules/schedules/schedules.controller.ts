import { Controller, Get, Query, Param } from '@nestjs/common';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll(@Query('from') from: string, @Query('to') to: string, @Query('date') date: string) {
    return this.schedulesService.findAll({ from, to, date });
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.schedulesService.findOne(id);
  }
}
