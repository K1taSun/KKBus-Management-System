import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Imię musi mieć od 2 do 50 znaków.' })
  first_name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'Nazwisko musi mieć od 2 do 50 znaków.' })
  last_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Nieprawidłowy format numeru telefonu.' })
  phone?: string;
}
