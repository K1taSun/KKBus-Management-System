import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, Min, Max, IsArray, ArrayMinSize, ValidateNested, IsEmail, IsString, Matches, Length, IsIn } from 'class-validator';

class GuestSeatDto {
  @IsInt({ message: 'Numer miejsca musi być liczbą całkowitą.' })
  @Min(1, { message: 'Numer miejsca nie może być mniejszy niż 1.' })
  @Max(150, { message: 'Numer miejsca nie może być większy niż 150.' })
  seatNumber: number;

  @IsNotEmpty()
  discountType: 'NORMAL' | 'STUDENT' | 'CHILD';
}

export class GuestBookSeatsDto {
  @IsInt()
  @IsNotEmpty({ message: 'Identyfikator kursu (scheduleId) jest wymagany.' })
  scheduleId: number;

  @IsArray({ message: 'Miejsca muszą być tablicą.' })
  @ArrayMinSize(1, { message: 'Musisz zarezerwować przynajmniej 1 miejsce.' })
  @ValidateNested({ each: true })
  @Type(() => GuestSeatDto)
  seats: GuestSeatDto[];

  @IsEmail({}, { message: 'Nieprawidłowy format adresu e-mail.' })
  @IsNotEmpty({ message: 'E-mail jest wymagany.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Imię jest wymagane.' })
  @Length(2, 50, { message: 'Imię musi mieć od 2 do 50 znaków.' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Nazwisko jest wymagane.' })
  @Length(2, 50, { message: 'Nazwisko musi mieć od 2 do 50 znaków.' })
  last_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Numer telefonu jest wymagany.' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Nieprawidłowy format numeru telefonu.' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Metoda płatności jest wymagana.' })
  @IsIn(['BLIK', 'VISA', 'MC', 'P24'], { message: 'Nieprawidłowa metoda płatności.' })
  paymentMethod: string;
}
