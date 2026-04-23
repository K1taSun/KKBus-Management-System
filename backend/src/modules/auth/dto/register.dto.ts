import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Podaj poprawny adres e-mail.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Imię jest wymagane.' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Nazwisko jest wymagane.' })
  last_name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
