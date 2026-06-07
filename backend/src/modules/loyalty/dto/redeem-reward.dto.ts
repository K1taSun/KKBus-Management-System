import { IsNotEmpty, IsInt } from 'class-validator';

export class RedeemRewardDto {
  @IsInt()
  @IsNotEmpty({ message: 'Identyfikator nagrody (rewardId) jest wymagany.' })
  rewardId: number;
}
