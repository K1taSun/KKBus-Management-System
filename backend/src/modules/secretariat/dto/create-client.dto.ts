import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber, IsBoolean, IsOptional, Matches } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
  dateOfBirth: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber('PL')
  phone?: string;

  @IsOptional()
  @IsBoolean()
  loyaltyOptIn?: boolean;
}
