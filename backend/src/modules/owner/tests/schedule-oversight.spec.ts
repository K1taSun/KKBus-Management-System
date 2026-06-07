import { Test, TestingModule } from '@nestjs/testing';
import { OwnerService } from '../owner.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Pool } from 'pg';

describe('OwnerService - Schedule Oversight', () => {
  let service: OwnerService;
  let pool: Pool;

  const mockPool = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnerService,
        {
          provide: 'DATABASE_POOL',
          useValue: mockPool,
        },
      ],
    }).compile();

    service = module.get<OwnerService>(OwnerService);
    pool = module.get<Pool>('DATABASE_POOL');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('overrideSchedule', () => {
    it('should throw BadRequestException if schedule is not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] }); // Schedule search returns empty

      await expect(
        service.overrideSchedule(1, { driverId: 'a000-b000' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if arrival time is before departure time', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1, driver_id: 'a000-b000', departure_time: '2026-10-10 10:00:00', arrival_time: '2026-10-10 11:00:00' }],
      });

      await expect(
        service.overrideSchedule(1, { departureTime: '2026-10-10 12:00:00' }) // New departure after current arrival
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if driver has an overlapping schedule', async () => {
      // Find current schedule
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1, driver_id: 'a000-b000', departure_time: '2026-10-10 10:00:00', arrival_time: '2026-10-10 11:00:00' }],
      });

      // Find overlap
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 2 }], // Found an overlap
      });

      await expect(
        service.overrideSchedule(1, { driverId: 'b000-c000' })
      ).rejects.toThrow(ConflictException);

      // Verify the overlap query was called with correct parameters
      expect(mockPool.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('SELECT id FROM schedules'),
        ['b000-c000', 1, '2026-10-10 10:00:00', '2026-10-10 11:00:00']
      );
    });

    it('should update schedule successfully if no conflicts', async () => {
      // Find current schedule
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1, driver_id: 'a000-b000', departure_time: '2026-10-10 10:00:00', arrival_time: '2026-10-10 11:00:00' }],
      });

      // No overlaps
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      // Update response
      mockPool.query.mockResolvedValueOnce({
        rows: [{ id: 1, driver_id: 'b000-c000', bus_id: 2 }],
      });

      const result = await service.overrideSchedule(1, { driverId: 'b000-c000', busId: 2 });
      
      expect(result).toEqual({ id: 1, driver_id: 'b000-c000', bus_id: 2 });
      
      // Verify update query
      expect(mockPool.query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('UPDATE schedules SET driver_id = $1, bus_id = $2 WHERE id = $3'),
        ['b000-c000', 2, 1]
      );
    });
  });
});
