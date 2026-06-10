import { OwnerService } from '../../backend/src/modules/owner/owner.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('OwnerService (Unit Tests)', () => {
  let service: OwnerService;
  let mockDataSource: any;
  let mockPublicInfoService: any;

  beforeEach(() => {
    mockDataSource = {
      query: jest.fn(),
    };

    mockPublicInfoService = {
      clearTimetableCache: jest.fn(),
      clearPricingCache: jest.fn(),
    };

    service = new OwnerService(mockDataSource as any, mockPublicInfoService as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      const mockUsers = [
        { id: 'u1', email: 'owner@example.com', first_name: 'Jan', last_name: 'Kowalski', status: 'Aktywny', role: { name: 'Właściciel' } },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockUsers);

      const result = await service.getUsers();
      expect(result).toEqual(mockUsers);
      expect(mockDataSource.query).toHaveBeenCalledWith(expect.stringContaining('FROM users u'));
    });
  });

  describe('createUser', () => {
    it('should throw ConflictException if email exists', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'u1' }]); // Email check returns existing user

      const dto = {
        email: 'exists@example.com',
        firstName: 'Jan',
        lastName: 'Kowalski',
        phone: '123',
        roleId: 2,
        password: 'Password123!',
      };

      await expect(service.createUser(dto)).rejects.toThrow(
        new ConflictException('Email already exists')
      );
    });

    it('should create user successfully with hashed password', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // Email unique
      mockDataSource.query.mockResolvedValueOnce([{ id: 'new-u1', email: 'new@example.com' }]); // Insert return

      const dto = {
        email: 'new@example.com',
        firstName: 'Anna',
        lastName: 'Nowak',
        phone: '456',
        roleId: 3,
        password: 'Password123!',
      };

      const result = await service.createUser(dto);

      expect(result.email).toBe('new@example.com');
      expect(mockDataSource.query).toHaveBeenCalledTimes(2);
    });
  });

  describe('changeUserStatus', () => {
    it('should update user status', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'u1', status: 'Zawieszony' }]);

      const result = await service.changeUserStatus('u1', { status: 'Zawieszony' });
      expect(result.status).toBe('Zawieszony');
    });

    it('should throw BadRequestException if user not found', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await expect(service.changeUserStatus('nonexistent', { status: 'Zawieszony' })).rejects.toThrow(
        new BadRequestException('User not found')
      );
    });
  });

  describe('overrideUserPassword', () => {
    it('should update user password hash', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.overrideUserPassword('u1', 'NewSecurePassword!');
      expect(result.message).toContain('Password successfully overridden');
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET password_hash'),
        expect.any(Array)
      );
    });
  });

  describe('createRoute', () => {
    it('should create route and clear timetable cache', async () => {
      const mockRoute = { id: 1, name: 'Trasa A', total_distance_km: 100 };
      mockDataSource.query.mockResolvedValueOnce([mockRoute]);

      const dto = {
        name: 'Trasa A',
        totalDistanceKm: 100,
        stops: [{ name: 'Stop1', lat: 50.0, lng: 19.9 }, { name: 'Stop2', lat: 50.1, lng: 20.0 }],
        label: 'A-B',
        description: 'Desc',
        color: '#111',
      };

      const result = await service.createRoute(dto);
      expect(result).toEqual(mockRoute);
      expect(mockPublicInfoService.clearTimetableCache).toHaveBeenCalled();
    });
  });

  describe('updateRoute', () => {
    it('should throw BadRequestException if route not found on empty update', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await expect(service.updateRoute(999, {})).rejects.toThrow(
        new BadRequestException('Route not found')
      );
    });

    it('should update specified fields and clear cache', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1, name: 'Updated' }]);

      const result = await service.updateRoute(1, { name: 'Updated', totalDistanceKm: 80 });
      expect(result.name).toBe('Updated');
      expect(mockPublicInfoService.clearTimetableCache).toHaveBeenCalled();
    });
  });

  describe('deactivateRoute', () => {
    it('should set route active flag to false', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1, is_active: false }]);

      const result = await service.deactivateRoute(1);
      expect(result.is_active).toBe(false);
      expect(mockPublicInfoService.clearTimetableCache).toHaveBeenCalled();
    });
  });

  describe('getSchedules', () => {
    it('should query schedules with date filter', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      await service.getSchedules('2026-06-15');
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE DATE(s.departure_time) = $1'),
        ['2026-06-15']
      );
    });
  });

  describe('overrideSchedule', () => {
    it('should throw BadRequestException if arrival time is before departure time', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1, driver_id: 'd1', departure_time: '2026-06-10', arrival_time: '2026-06-11' }]);

      const dto = {
        departureTime: '2026-06-15T12:00:00Z',
        arrivalTime: '2026-06-15T11:00:00Z', // Arrival before departure
      };

      await expect(service.overrideSchedule(1, dto)).rejects.toThrow(
        new BadRequestException('Arrival time must be after departure time')
      );
    });

    it('should throw ConflictException if driver has overlap', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1, driver_id: 'd1', departure_time: '2026-06-10', arrival_time: '2026-06-11' }]);
      mockDataSource.query.mockResolvedValueOnce([{ id: 2 }]); // Overlap found

      const dto = {
        departureTime: '2026-06-15T12:00:00Z',
        arrivalTime: '2026-06-15T14:00:00Z',
      };

      await expect(service.overrideSchedule(1, dto)).rejects.toThrow(
        new ConflictException('Driver has an overlapping schedule')
      );
    });
  });

  describe('createPricingPolicy', () => {
    it('should archive old policies and create new one', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // Archive
      mockDataSource.query.mockResolvedValueOnce([{ id: 1, version_name: 'v2' }]); // Insert

      const dto = {
        versionName: 'v2',
        basePriceMultiplier: 1.1,
        studentDiscountPercent: 50,
        childDiscountPercent: 37,
        loyaltyPointValue: 0.1,
      };

      const result = await service.createPricingPolicy(dto);
      expect(result.version_name).toBe('v2');
      expect(mockPublicInfoService.clearPricingCache).toHaveBeenCalled();
    });
  });

  describe('getFinancialAnalytics', () => {
    it('should aggregate revenue and tickets', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ total_revenue: 1500, total_tickets: 45 }]); // summary
      mockDataSource.query.mockResolvedValueOnce([{ total_reservations: 50 }]); // reservations
      mockDataSource.query.mockResolvedValueOnce([{ route_name: 'Trasa A', revenue: 1000 }]); // routes
      mockDataSource.query.mockResolvedValueOnce([{ date: '2026-06-10', revenue: 500 }]); // date

      const result = await service.getFinancialAnalytics('2026-06-01', '2026-06-10');

      expect(result.totalRevenue).toBe(1500);
      expect(result.totalTickets).toBe(45);
      expect(result.totalReservations).toBe(50);
      expect(result.revenueByRoute).toHaveLength(1);
      expect(result.revenueByDate).toHaveLength(1);
    });
  });

  describe('getFuelAndCourseAnalytics', () => {
    it('should calculate efficiencies per route', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { route_name: 'Trasa A', total_distance: 200, total_fuel: 40 },
      ]);

      const result = await service.getFuelAndCourseAnalytics('2026-06-01', '2026-06-10');

      expect(result.totalDistance).toBe(200);
      expect(result.totalFuelUsed).toBe(40);
      expect(result.avgFuelConsumption).toBe(20); // (40 / 200) * 100
      expect(result.efficiencyByRoute[0].consumptionPer100km).toBe(20);
    });
  });

  describe('deleteUser', () => {
    it('should throw ConflictException if driver assigned to schedule', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1 }]); // Schedule check returns conflict

      await expect(service.deleteUser('driver-1')).rejects.toThrow(
        new ConflictException('Nie można usunąć użytkownika, ponieważ jest przypisany do zaplanowanych kursów jako kierowca.')
      );
    });

    it('should delete user if no schedule conflicts', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // No conflicts
      mockDataSource.query.mockResolvedValueOnce([]); // Delete

      const result = await service.deleteUser('driver-new');
      expect(result.message).toContain('Użytkownik został usunięty');
    });
  });
});
