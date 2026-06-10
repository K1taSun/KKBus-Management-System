import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, Min, Max, IsArray, ArrayMinSize, ValidateNested, IsOptional, IsString, IsIn } from 'class-validator';

class SeatDto {
  @IsInt({ message: 'Numer miejsca musi być liczbą całkowitą.' })
  @Min(1, { message: 'Numer miejsca nie może być mniejszy niż 1.' })
  @Max(150, { message: 'Numer miejsca nie może być większy niż 150.' })
  seatNumber: number;

  @IsNotEmpty()
  discountType: 'NORMAL' | 'STUDENT' | 'CHILD';
}

export class BookSeatsDto {
  @IsInt()
  @IsNotEmpty({ message: 'Identyfikator kursu (scheduleId) jest wymagany.' })
  scheduleId: number;

  @IsArray({ message: 'Miejsca muszą być tablicą.' })
  @ArrayMinSize(1, { message: 'Musisz zarezerwować przynajmniej 1 miejsce.' })
  @ValidateNested({ each: true })
  @Type(() => SeatDto)
  seats: SeatDto[];

  @IsOptional()
  useLoyaltyPoints?: boolean;

  @IsString()
  @IsNotEmpty({ message: 'Metoda płatności jest wymagana.' })
  @IsIn(['BLIK', 'VISA', 'MC', 'P24', 'ON_BOARD'], { message: 'Nieprawidłowa metoda płatności.' })
  paymentMethod: string;
}
