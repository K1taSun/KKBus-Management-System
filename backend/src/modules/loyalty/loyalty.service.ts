import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RedeemRewardDto } from './dto/redeem-reward.dto';

@Injectable()
export class LoyaltyService {
  constructor(private readonly dataSource: DataSource) {}

  async getBalance(userId: string) {
    const res = await this.dataSource.query(
      `SELECT points_balance, last_transaction_date FROM loyalty_points WHERE user_id = $1`,
      [userId],
    );
    if (res.length === 0) {
      return { pointsBalance: 0, lastTransactionDate: null };
    }
    return {
      pointsBalance: res[0].points_balance,
      lastTransactionDate: res[0].last_transaction_date,
    };
  }

  async getRewardsCatalog() {
    return this.dataSource.query(
      `SELECT id, name, required_points FROM loyalty_rewards WHERE is_active = TRUE`,
    );
  }

  async getTransactionHistory(userId: string) {
    return this.dataSource.query(
      `SELECT id, points_delta, description, transaction_date
       FROM loyalty_transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC
       LIMIT 50`,
      [userId],
    );
  }

  async redeemReward(userId: string, dto: RedeemRewardDto) {
    const { rewardId } = dto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Sprawdzamy stan punktów w portfelu (lock FOR UPDATE)
      const walletRes = await queryRunner.manager.query(
        `SELECT points_balance FROM loyalty_points WHERE user_id = $1 FOR UPDATE`,
        [userId],
      );

      if (walletRes.length === 0) {
        throw new BadRequestException('Użytkownik nie bierze udziału w programie lojalnościowym.');
      }

      const currentPoints = walletRes[0].points_balance;

      // 2. Pobieramy wymagane punkty dla wybranej nagrody
      const rewardRes = await queryRunner.manager.query(
        `SELECT name, required_points, is_active FROM loyalty_rewards WHERE id = $1`,
        [rewardId],
      );

      if (rewardRes.length === 0 || !rewardRes[0].is_active) {
        throw new BadRequestException('Wybrana nagroda jest nieaktywna lub nie istnieje.');
      }

      const { name: rewardName, required_points: requiredPoints } = rewardRes[0];

      // 3. Walidacja stanu punktów
      if (currentPoints < requiredPoints) {
        throw new BadRequestException(`Niewystarczająca liczba punktów. Posiadasz: ${currentPoints}, wymagane: ${requiredPoints}.`);
      }

      // 4. Atomowe odjęcie punktów
      await queryRunner.manager.query(
        `UPDATE loyalty_points 
         SET points_balance = points_balance - $1, last_transaction_date = NOW() 
         WHERE user_id = $2`,
        [requiredPoints, userId],
      );

      // 5. Zapis w logach audytowych
      await queryRunner.manager.query(
        `INSERT INTO loyalty_transactions (user_id, points_delta, description)
         VALUES ($1, $2, $3)`,
        [userId, -requiredPoints, `Wymiana punktów na nagrodę: ${rewardName}`],
      );

      await queryRunner.commitTransaction();

      // Generowanie kodu vouchera (mock)
      const voucherCode = `KKB-VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      return {
        message: 'Punkty zostały pomyślnie wymienione na nagrodę.',
        rewardRedeemed: rewardName,
        voucherCode,
        remainingPoints: currentPoints - requiredPoints,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Wywoływane po zakończeniu trasy
  async addPointsForTrip(userId: string, distanceKm: number) {
    const pointsToAdd = Math.round(distanceKm);
    if (pointsToAdd <= 0) return;

    await this.dataSource.transaction(async (manager) => {
      await manager.query(
        `UPDATE loyalty_points 
         SET points_balance = points_balance + $1, last_transaction_date = NOW()
         WHERE user_id = $2`,
        [pointsToAdd, userId],
      );

      await manager.query(
        `INSERT INTO loyalty_transactions (user_id, points_delta, description)
         VALUES ($1, $2, $3)`,
        [userId, pointsToAdd, `Punkty naliczone za przejazd trasą o długości ${distanceKm} km.`],
      );
    });
  }
}
