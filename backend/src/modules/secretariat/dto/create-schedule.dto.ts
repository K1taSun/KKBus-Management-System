import { IsNotEmpty, IsNumber, IsString, IsDateString, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  routeId: number;

  @IsNotEmpty()
  @IsNumber()
  busId: number;

  @IsNotEmpty()
  @IsString()
  driverId: string;

  @IsNotEmpty()
  @IsDateString()
  departureTime: string;

  @IsNotEmpty()
  @IsDateString()
  arrivalTime: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  priceBase: number;
}
