import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignFleetDto {
  @IsNotEmpty()
  @IsNumber()
  busId: number;
}
