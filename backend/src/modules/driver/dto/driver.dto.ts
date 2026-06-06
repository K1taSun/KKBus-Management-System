import { IsInt, IsNumber, IsPositive, IsArray, IsDateString, IsEnum, ArrayUnique } from 'class-validator';

export enum AvailabilityStatus {
  AVAILABLE = 'Dostępny',
  UNAVAILABLE = 'Niedostępny',
  HOLIDAY = 'Urlop',
  SICK_LEAVE = 'Zwolnienie'
}

export class SubmitReportDto {
  @IsInt()
  @IsPositive()
  scheduleId: number;

  @IsNumber()
  @IsPositive()
  fuelLiters: number;

  @IsNumber()
  @IsPositive()
  fuelCost: number;

  @IsInt()
  @IsPositive()
  distanceKm: number;

  @IsArray()
  @ArrayUnique()
  presentUserIds: string[];

  @IsArray()
  @ArrayUnique()
  absentUserIds: string[];
}

export class SetAvailabilityDto {
  @IsDateString()
  availableDate: string;

  @IsEnum(AvailabilityStatus)
  status: AvailabilityStatus;
}

export enum InspectionType {
  PRE_TRIP = 'PRE_TRIP',
  POST_TRIP = 'POST_TRIP'
}

export class SubmitInspectionDto {
  @IsInt() @IsPositive() scheduleId: number;
  @IsInt() @IsPositive() busId: number;
  @IsEnum(InspectionType) type: InspectionType;
  @IsInt() mileage: number;
  @IsInt() fuelLevel: number;
  
  // boolean casted values
  lightsOk: boolean;
  tiresOk: boolean;
  interiorOk: boolean;
  fluidsOk: boolean;
  emergencyEquipmentOk: boolean;
  keysReturned?: boolean;
  notes?: string;
}

export enum DefectSeverity {
  LOW = 'NISKA',
  MEDIUM = 'ŚREDNIA',
  CRITICAL = 'KRYTYCZNA'
}

export class SubmitDefectDto {
  @IsInt() @IsPositive() busId: number;
  scheduleId?: number;
  @IsEnum(DefectSeverity) severity: DefectSeverity;
  description: string;
}

export class SubmitSOSDto {
  @IsInt() @IsPositive() busId: number;
  scheduleId?: number;
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
}
