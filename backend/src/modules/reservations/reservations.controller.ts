import { Controller, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReservationsService } from './reservations.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async bookSeat(@Request() req, @Body() body: any) {
    // req.user pochodzi z JwtStrategy (wzięte z tokena)
    return this.reservationsService.bookSeat(req.user.userId, body);
  }

  @Delete(':id')
  async cancelReservation(@Request() req, @Param('id') reservationId: string) {
    return this.reservationsService.cancelReservation(req.user.userId, reservationId);
  }
}
