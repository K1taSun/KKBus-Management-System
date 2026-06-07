import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { RedeemRewardDto } from './dto/redeem-reward.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    return this.loyaltyService.getBalance(req.user.userId);
  }

  @Get('rewards')
  async getCatalog() {
    return this.loyaltyService.getRewardsCatalog();
  }

  @Get('transactions')
  async getTransactions(@Request() req) {
    return this.loyaltyService.getTransactionHistory(req.user.userId);
  }

  @Post('redeem')
  async redeemReward(@Request() req, @Body() dto: RedeemRewardDto) {
    return this.loyaltyService.redeemReward(req.user.userId, dto);
  }
}
