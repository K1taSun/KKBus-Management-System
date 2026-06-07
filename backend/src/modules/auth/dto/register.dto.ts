import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsDateString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Nieprawidłowy format adresu e-mail.' })
  @IsNotEmpty({ message: 'E-mail jest wymagany.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Hasło jest wymagane.' })
  @Length(8, 50, { message: 'Hasło musi mieć od 8 do 50 znaków.' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Hasło musi zawierać wielką literę, małą literę, cyfrę lub znak specjalny.',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Imię jest wymagane.' })
  @Length(2, 50, { message: 'Imię musi mieć od 2 do 50 znaków.' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Nazwisko jest wymagane.' })
  @Length(2, 50, { message: 'Nazwisko musi mieć od 2 do 50 znaków.' })
  last_name: string;

  @IsDateString({}, { message: 'Nieprawidłowy format daty urodzenia (wymagany YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'Data urodzenia jest wymagana.' })
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty({ message: 'Numer telefonu jest wymagany.' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Nieprawidłowy format numeru telefonu.' })
  phone: string;

  @IsBoolean({ message: 'OptIn programu lojalnościowego musi być wartością logiczną.' })
  @IsNotEmpty({ message: 'Zgoda na program lojalnościowy jest wymagana.' })
  loyaltyProgramConsent: boolean;
}
