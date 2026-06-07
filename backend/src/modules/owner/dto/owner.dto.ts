import { IsEmail, IsString, IsNotEmpty, IsInt, IsOptional, IsArray, IsNumber, Min, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsInt()
  roleId: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangeUserStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // 'active', 'suspended', 'blocked'
}

export class StopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  totalDistanceKm: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops: StopDto[];
}

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalDistanceKm?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  @IsOptional()
  stops?: StopDto[];
}

export class OverrideScheduleDto {
  @IsString()
  @IsOptional()
  driverId?: string;

  @IsInt()
  @IsOptional()
  busId?: number;

  @IsString()
  @IsOptional()
  departureTime?: string;

  @IsString()
  @IsOptional()
  arrivalTime?: string;
}

export class CreatePricingPolicyDto {
  @IsString()
  @IsNotEmpty()
  versionName: string;

  @IsNumber()
  @Min(0)
  basePriceMultiplier: number;

  @IsInt()
  @Min(0)
  studentDiscountPercent: number;

  @IsInt()
  @Min(0)
  childDiscountPercent: number;

  @IsNumber()
  @Min(0)
  loyaltyPointValue: number;
}
