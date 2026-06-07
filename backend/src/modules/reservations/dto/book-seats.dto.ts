import { IsNotEmpty, IsInt, Min, Max, IsArray, ArrayMinSize } from 'class-validator';

export class BookSeatsDto {
  @IsInt()
  @IsNotEmpty({ message: 'Identyfikator kursu (scheduleId) jest wymagany.' })
  scheduleId: number;

  @IsArray({ message: 'Numery miejsc muszą być tablicą liczb.' })
  @ArrayMinSize(1, { message: 'Musisz zarezerwować przynajmniej 1 miejsce.' })
  @IsInt({ each: true, message: 'Numer miejsca musi być liczbą całkowitą.' })
  @Min(1, { each: true, message: 'Numer miejsca nie może być mniejszy niż 1.' })
  @Max(60, { each: true, message: 'Numer miejsca nie może być większy niż 60.' })
  seatNumbers: number[];
}
