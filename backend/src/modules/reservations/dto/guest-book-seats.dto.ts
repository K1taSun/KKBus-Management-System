import { IsNotEmpty, IsInt, Min, Max, IsArray, ArrayMinSize, IsEmail, IsString, Matches, Length } from 'class-validator';

export class GuestBookSeatsDto {
  @IsInt()
  @IsNotEmpty({ message: 'Identyfikator kursu (scheduleId) jest wymagany.' })
  scheduleId: number;

  @IsArray({ message: 'Numery miejsc muszą być tablicą liczb.' })
  @ArrayMinSize(1, { message: 'Musisz zarezerwować przynajmniej 1 miejsce.' })
  @IsInt({ each: true, message: 'Numer miejsca musi być liczbą całkowitą.' })
  @Min(1, { each: true, message: 'Numer miejsca nie może być mniejszy niż 1.' })
  @Max(60, { each: true, message: 'Numer miejsca nie może być większy niż 60.' })
  seatNumbers: number[];

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
}
