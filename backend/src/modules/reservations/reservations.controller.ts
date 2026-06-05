import { Controller, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { BookSeatsDto } from './dto/book-seats.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async bookSeats(@Request() req, @Body() dto: BookSeatsDto) {
    return this.reservationsService.bookSeats(req.user.userId, dto);
  }

  @Delete(':id')
  async cancelReservation(@Request() req, @Param('id') reservationId: string) {
    return this.reservationsService.cancelReservation(req.user.userId, reservationId);
  }
}
