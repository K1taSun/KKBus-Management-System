import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Podaj poprawny adres e-mail.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Hasło jest wymagane.' })
  password: string;
}
