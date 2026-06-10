import { ReportsService } from '../../backend/src/modules/reports/reports.service';
import { BadRequestException } from '@nestjs/common';

describe('ReportsService (Unit Tests)', () => {
  let service: ReportsService;
  let mockDataSource: any;
  let mockQueryRunner: any;

  beforeEach(() => {
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      query: jest.fn(),
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      query: jest.fn(),
    };

    service = new ReportsService(mockDataSource as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('submitRouteReport', () => {
    it('should submit report, award loyalty points and register no-shows', async () => {
      // 1. Insert route report
      mockQueryRunner.query.mockResolvedValueOnce([]);
      // 2. Update loyalty points for present users
      mockQueryRunner.query.mockResolvedValueOnce([]);
      // 3. Update no_shows for absent users
      mockQueryRunner.query.mockResolvedValueOnce([]);

      const body = {
        scheduleId: 1,
        fuelLiters: 30,
        distanceKm: 100,
        presentUserIds: ['user-a', 'user-b'],
        absentUserIds: ['user-c'],
      };

      const result = await service.submitRouteReport('driver-1', body);

      expect(result.message).toContain('Raport z trasy zatwierdzony');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should handle report with no present or absent users', async () => {
      // Just the report insert
      mockQueryRunner.query.mockResolvedValueOnce([]);

      const body = {
        scheduleId: 1,
        fuelLiters: 20,
        distanceKm: 80,
        presentUserIds: [],
        absentUserIds: [],
      };

      const result = await service.submitRouteReport('driver-1', body);

      expect(result.message).toContain('Raport z trasy zatwierdzony');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException for duplicate report (23505 code)', async () => {
      mockQueryRunner.query.mockRejectedValueOnce({ code: '23505' });

      const body = {
        scheduleId: 1,
        fuelLiters: 30,
        distanceKm: 100,
        presentUserIds: [],
        absentUserIds: [],
      };

      await expect(service.submitRouteReport('driver-1', body)).rejects.toThrow(
        new BadRequestException('Raport dla tego kursu został już złożony!')
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should re-throw non-duplicate database errors', async () => {
      mockQueryRunner.query.mockRejectedValueOnce(new Error('DB connection lost'));

      const body = {
        scheduleId: 1,
        fuelLiters: 30,
        distanceKm: 100,
        presentUserIds: [],
        absentUserIds: [],
      };

      await expect(service.submitRouteReport('driver-1', body)).rejects.toThrow('DB connection lost');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getRoutePopularity', () => {
    it('should return popularity report with route names and ticket counts', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { Trasa: 'Kraków - Kielce', Sprzedane_Bilety: '42' },
        { Trasa: 'Kraków - Tarnów', Sprzedane_Bilety: '28' },
      ]);

      const result = await service.getRoutePopularity();

      expect(result.title).toBe('Raport Popularności Tras');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].Trasa).toBe('Kraków - Kielce');
    });

    it('should return empty data array when no routes exist', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getRoutePopularity();

      expect(result.title).toBe('Raport Popularności Tras');
      expect(result.data).toEqual([]);
    });
  });

  describe('getFinancialEstimate', () => {
    it('should return financial estimate with revenue data', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { Trasa: 'Kraków - Kielce', Sprzedane_Bilety: '42', Szacowany_Przychod: '1050.00' },
      ]);

      const result = await service.getFinancialEstimate();

      expect(result.title).toBe('Szacunkowe Przychody');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].Szacowany_Przychod).toBe('1050.00');
    });

    it('should return empty data when no confirmed reservations exist', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getFinancialEstimate();

      expect(result.title).toBe('Szacunkowe Przychody');
      expect(result.data).toEqual([]);
    });
  });
});
