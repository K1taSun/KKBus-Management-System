import { SchedulesService } from '../../backend/src/modules/schedules/schedules.service';
import { NotFoundException } from '@nestjs/common';

describe('SchedulesService (Unit Tests)', () => {
  let service: SchedulesService;
  let mockDataSource: any;

  beforeEach(() => {
    mockDataSource = {
      query: jest.fn(),
    };
    service = new SchedulesService(mockDataSource as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findAll', () => {
    it('should return all schedules when no filters are provided', async () => {
      const mockSchedules = [
        { id: 1, route_name: 'Trasa A', departure_time: '2026-06-15T10:00:00Z', capacity: 19, available_seats: 15 },
        { id: 2, route_name: 'Trasa B', departure_time: '2026-06-16T08:00:00Z', capacity: 19, available_seats: 10 },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockSchedules);

      const result = await service.findAll({});

      expect(result).toHaveLength(2);
      expect(mockDataSource.query).toHaveBeenCalledWith(expect.stringContaining('WHERE 1=1'), []);
    });

    it('should add ILIKE filter when "from" parameter is provided', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await service.findAll({ from: 'Kraków' });

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        ['%Kraków%']
      );
    });

    it('should add date filter when "date" parameter is provided', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await service.findAll({ date: '2026-06-15' });

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('DATE(s.departure_time)'),
        ['2026-06-15']
      );
    });

    it('should combine multiple filters in SQL query', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await service.findAll({ from: 'Kraków', to: 'Kielce', date: '2026-06-15' });

      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        ['%Kraków%', '%Kielce%', '2026-06-15']
      );
    });

    it('should return empty array when no schedules match', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.findAll({ from: 'Nonexistent' });

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return schedule details for existing schedule', async () => {
      const mockSchedule = {
        id: 1,
        route_name: 'Trasa A',
        total_distance_km: 120,
        departure_time: '2026-06-15T10:00:00Z',
        arrival_time: '2026-06-15T12:00:00Z',
        price_base: '25.00',
        bus_model: 'Solaris',
        capacity: 19,
        available_seats: 15,
        stops: ['Kraków', 'Kielce'],
        booked_seats: [3, 7],
      };
      mockDataSource.query.mockResolvedValueOnce([mockSchedule]);

      const result = await service.findOne(1);

      expect(result).toEqual(mockSchedule);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE s.id = $1'),
        [1]
      );
    });

    it('should throw NotFoundException when schedule does not exist', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Kurs o id=999 nie istnieje.')
      );
    });
  });
});
