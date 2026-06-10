import { PublicInfoService } from '../../backend/src/modules/public-info/public-info.service';

describe('PublicInfoService (Unit Tests)', () => {
  let service: PublicInfoService;
  let mockDataSource: any;

  beforeEach(() => {
    mockDataSource = {
      query: jest.fn(),
    };
    service = new PublicInfoService(mockDataSource as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getRoutes', () => {
    it('should return mapped routes with "route-" prefix on id', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { id: 1, name: 'Trasa A', label: 'A', description: 'Opis A', color: '#ff0000', stops: ['X', 'Y'] },
        { id: 2, name: 'Trasa B', label: 'B', description: 'Opis B', color: '#00ff00', stops: ['M', 'N'] },
      ]);

      const result = await service.getRoutes();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('route-1');
      expect(result[0].name).toBe('Trasa A');
      expect(result[1].id).toBe('route-2');
    });

    it('should return cached data on subsequent calls within TTL', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { id: 1, name: 'Trasa A', label: 'A', description: 'Opis A', color: '#ff0000', stops: [] },
      ]);

      const result1 = await service.getRoutes();
      const result2 = await service.getRoutes();

      expect(mockDataSource.query).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('should return empty array when no active routes exist', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getRoutes();

      expect(result).toEqual([]);
    });
  });

  describe('getRoutesAndTimetable', () => {
    it('should return timetable data from database', async () => {
      const mockData = [
        {
          schedule_id: 1,
          departure_time: '2026-06-15T10:00:00Z',
          arrival_time: '2026-06-15T12:00:00Z',
          price_base: '25.00',
          route_name: 'Trasa A',
          stops: ['X', 'Y'],
          total_distance_km: 50,
          bus_model: 'Solaris',
          registration_number: 'KK12345',
          capacity: 19,
          available_seats: 15,
        },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockData);

      const result = await service.getRoutesAndTimetable();

      expect(result).toEqual(mockData);
    });

    it('should cache timetable and not re-query within TTL', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ schedule_id: 1 }]);

      await service.getRoutesAndTimetable();
      await service.getRoutesAndTimetable();

      expect(mockDataSource.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearTimetableCache', () => {
    it('should force re-query after cache is cleared', async () => {
      mockDataSource.query.mockResolvedValue([{ id: 1, name: 'A', label: 'A', description: '', color: '', stops: [] }]);

      await service.getRoutes();
      service.clearTimetableCache();
      await service.getRoutes();

      expect(mockDataSource.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearPricingCache', () => {
    it('should force re-query pricing after cache is cleared', async () => {
      mockDataSource.query.mockResolvedValue([
        { base_price_multiplier: '1.0', student_discount_percent: '51', child_discount_percent: '30', loyalty_point_value: '0.1' },
      ]);

      await service.getPricingAndDiscounts();
      service.clearPricingCache();
      await service.getPricingAndDiscounts();

      expect(mockDataSource.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPricingAndDiscounts', () => {
    it('should return pricing with discounts from database policy', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { base_price_multiplier: '1.5', student_discount_percent: '51', child_discount_percent: '30', loyalty_point_value: '0.1' },
      ]);

      const result = await service.getPricingAndDiscounts();

      expect(result.basePrice).toBe(37.50); // 25 * 1.5
      expect(result.currency).toBe('PLN');
      expect(result.discounts).toHaveLength(3);
      expect(result.discounts[0].name).toBe('Studencka');
      expect(result.discounts[0].valuePct).toBe(51);
      expect(result.discounts[1].name).toBe('Szkolna');
      expect(result.discounts[1].valuePct).toBe(30);
      expect(result.discounts[2].name).toBe('Dziecięca (do lat 4)');
      expect(result.discounts[2].multiplier).toBe(0.00);
    });

    it('should use default discounts when no pricing policy exists in DB', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getPricingAndDiscounts();

      expect(result.basePrice).toBe(25.00); // default multiplier = 1.0
      expect(result.discounts[0].valuePct).toBe(51);
      expect(result.discounts[1].valuePct).toBe(30);
    });
  });

  describe('searchTimetable', () => {
    it('should filter timetable results by from/to stops and date', async () => {
      const futureDate = new Date(Date.now() + 4 * 60 * 60 * 1000);
      const dateStr = futureDate.toISOString().split('T')[0];

      mockDataSource.query.mockResolvedValueOnce([
        {
          schedule_id: 1,
          departure_time: futureDate.toISOString(),
          arrival_time: new Date(futureDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          price_base: '100.00',
          route_name: 'Kraków - Kielce',
          stops: [{ name: 'Kraków' }, { name: 'Miechów' }, { name: 'Kielce' }],
          total_distance_km: 120,
          bus_model: 'Solaris',
          registration_number: 'KK12345',
          capacity: 19,
          available_seats: 10,
        },
      ]);

      const result = await service.searchTimetable('Kraków', 'Kielce', dateStr, 1);

      expect(result).toHaveLength(1);
      expect(result[0].stops).toEqual(['Kraków', 'Miechów', 'Kielce']);
    });

    it('should return empty array when no matching routes found', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.searchTimetable('Wrocław', 'Gdańsk', '2026-06-15', 1);

      expect(result).toEqual([]);
    });

    it('should filter out routes with insufficient seats', async () => {
      const futureDate = new Date(Date.now() + 4 * 60 * 60 * 1000);
      const dateStr = futureDate.toISOString().split('T')[0];

      mockDataSource.query.mockResolvedValueOnce([
        {
          schedule_id: 1,
          departure_time: futureDate.toISOString(),
          arrival_time: futureDate.toISOString(),
          price_base: '50.00',
          route_name: 'A - B',
          stops: ['A', 'B'],
          total_distance_km: 50,
          bus_model: 'X',
          registration_number: 'X',
          capacity: 19,
          available_seats: 2, // only 2 seats
        },
      ]);

      const result = await service.searchTimetable('A', 'B', dateStr, 5); // need 5

      expect(result).toEqual([]);
    });

    it('should calculate proportional price for partial route segments', async () => {
      const futureDate = new Date(Date.now() + 4 * 60 * 60 * 1000);
      const dateStr = futureDate.toISOString().split('T')[0];

      mockDataSource.query.mockResolvedValueOnce([
        {
          schedule_id: 1,
          departure_time: futureDate.toISOString(),
          arrival_time: futureDate.toISOString(),
          price_base: '100.00',
          route_name: 'A - D',
          stops: ['A', 'B', 'C', 'D'], // 3 segments total
          total_distance_km: 90,
          bus_model: 'X',
          registration_number: 'X',
          capacity: 19,
          available_seats: 10,
        },
      ]);

      // Travel from A to C = 2 segments out of 3
      const result = await service.searchTimetable('A', 'C', dateStr, 1);

      expect(result).toHaveLength(1);
      expect(result[0].price_base).toBe('66.67'); // 100 * (2/3) = 66.67
      expect(result[0].total_distance_km).toBe(60); // 90 * (2/3) = 60
    });
  });

  describe('getRecentlyCompletedCourses', () => {
    it('should return recently completed courses from database', async () => {
      const mockCourses = [
        { id: 1, route_name: 'Trasa A', submitted_at: '2026-06-10T10:00:00Z' },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockCourses);

      const result = await service.getRecentlyCompletedCourses();

      expect(result).toEqual(mockCourses);
    });

    it('should return empty array when no completed courses exist', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getRecentlyCompletedCourses();

      expect(result).toEqual([]);
    });
  });
});
