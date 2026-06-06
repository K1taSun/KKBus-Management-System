import { IsNotEmpty, IsDateString } from 'class-validator';

export class GenerateReportDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
