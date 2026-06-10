import { LoyaltyService } from '../../backend/src/modules/loyalty/loyalty.service';
import { BadRequestException } from '@nestjs/common';

describe('LoyaltyService (Unit Tests)', () => {
  let service: LoyaltyService;
  let mockDataSource: any;
  let mockQueryRunner: any;

  beforeEach(() => {
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: {
        query: jest.fn(),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      query: jest.fn(),
      transaction: jest.fn(),
    };

    service = new LoyaltyService(mockDataSource as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getBalance', () => {
    it('should return points balance and last transaction date for existing user', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { points_balance: 250, last_transaction_date: '2026-06-10T10:00:00Z' },
      ]);

      const result = await service.getBalance('user-1');

      expect(result.pointsBalance).toBe(250);
      expect(result.lastTransactionDate).toBe('2026-06-10T10:00:00Z');
    });

    it('should return 0 points when user has no loyalty record', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getBalance('user-nonexistent');

      expect(result.pointsBalance).toBe(0);
      expect(result.lastTransactionDate).toBeNull();
    });
  });

  describe('getRewardsCatalog', () => {
    it('should return active rewards from database', async () => {
      const mockRewards = [
        { id: 1, name: 'Darmowy bilet', required_points: 500 },
        { id: 2, name: '10% zniżki', required_points: 200 },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockRewards);

      const result = await service.getRewardsCatalog();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Darmowy bilet');
    });

    it('should return empty array when no active rewards exist', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getRewardsCatalog();

      expect(result).toEqual([]);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history for a user ordered by date DESC', async () => {
      const mockTransactions = [
        { id: 1, points_delta: 100, description: 'Przejazd', transaction_date: '2026-06-10' },
        { id: 2, points_delta: -200, description: 'Wymiana na nagrodę', transaction_date: '2026-06-09' },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockTransactions);

      const result = await service.getTransactionHistory('user-1');

      expect(result).toHaveLength(2);
      expect(result[0].points_delta).toBe(100);
    });
  });

  describe('redeemReward', () => {
    it('should throw BadRequestException if user is not in loyalty program', async () => {
      // Wallet query returns empty
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      await expect(service.redeemReward('user-1', { rewardId: 1 } as any)).rejects.toThrow(
        new BadRequestException('Użytkownik nie bierze udziału w programie lojalnościowym.')
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if reward does not exist', async () => {
      // Wallet query returns balance
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ points_balance: 500 }]);
      // Reward query returns empty
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      await expect(service.redeemReward('user-1', { rewardId: 999 } as any)).rejects.toThrow(
        new BadRequestException('Wybrana nagroda jest nieaktywna lub nie istnieje.')
      );
    });

    it('should throw BadRequestException if user has insufficient points', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ points_balance: 100 }]);
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { name: 'Darmowy bilet', required_points: 500, is_active: true },
      ]);

      await expect(service.redeemReward('user-1', { rewardId: 1 } as any)).rejects.toThrow(
        /Niewystarczająca liczba punktów/
      );
    });

    it('should successfully redeem reward and return voucher code', async () => {
      // Wallet balance
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ points_balance: 600 }]);
      // Reward details
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { name: 'Darmowy bilet', required_points: 500, is_active: true },
      ]);
      // Update points balance
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // Insert loyalty transaction log
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      const result = await service.redeemReward('user-1', { rewardId: 1 } as any);

      expect(result.message).toContain('pomyślnie wymienione');
      expect(result.rewardRedeemed).toBe('Darmowy bilet');
      expect(result.voucherCode).toMatch(/^KKB-VOUCHER-/);
      expect(result.remainingPoints).toBe(100); // 600 - 500
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('addPointsForTrip', () => {
    it('should add points equal to distance in km', async () => {
      const mockManager = { query: jest.fn().mockResolvedValue([]) };
      mockDataSource.transaction.mockImplementation(async (cb: Function) => {
        await cb(mockManager);
      });

      await service.addPointsForTrip('user-1', 120);

      expect(mockManager.query).toHaveBeenCalledTimes(2);
      expect(mockManager.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE loyalty_points'),
        [120, 'user-1']
      );
      expect(mockManager.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO loyalty_transactions'),
        ['user-1', 120, expect.stringContaining('120 km')]
      );
    });

    it('should not add points if distance is 0', async () => {
      await service.addPointsForTrip('user-1', 0);

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });

    it('should not add points if distance is negative', async () => {
      await service.addPointsForTrip('user-1', -10);

      expect(mockDataSource.transaction).not.toHaveBeenCalled();
    });
  });
});
