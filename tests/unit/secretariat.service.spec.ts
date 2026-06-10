import { SecretariatService } from '../../backend/src/modules/secretariat/secretariat.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('SecretariatService (Unit Tests)', () => {
  let service: SecretariatService;
  let mockDataSource: any;
  let mockQueryRunner: any;
  let mockPublicInfoService: any;
  let mockReservationsService: any;

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
    };

    mockPublicInfoService = {
      clearTimetableCache: jest.fn(),
    };

    mockReservationsService = {
      bookSeatsOnBehalf: jest.fn(),
    };

    service = new SecretariatService(
      mockDataSource as any,
      mockPublicInfoService as any,
      mockReservationsService as any
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createClient', () => {
    it('should throw ConflictException if email exists', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 'u1' }]); // Email check

      const dto = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        dateOfBirth: '1990-01-01',
        email: 'exists@example.com',
        phone: '123',
        loyaltyOptIn: true,
      };

      await expect(service.createClient(dto)).rejects.toThrow(
        new ConflictException('Email already exists')
      );
    });

    it('should create client and profile in a transaction', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // Email unique
      mockDataSource.query.mockResolvedValueOnce([{ id: 'role-1' }]); // Role check
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ id: 'new-u1' }]); // User insert

      const dto = {
        firstName: 'Jan',
        lastName: 'Kowalski',
        dateOfBirth: '1990-01-01',
        email: 'new-client@example.com',
        phone: '123',
        loyaltyOptIn: true,
      };

      const result = await service.createClient(dto);

      expect(result.clientNumber).toBeDefined();
      expect(result.tempPassword).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('createSchedule', () => {
    it('should throw BadRequestException for past date', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 5);

      const dto = {
        routeId: 1,
        busId: 1,
        driverId: 'd1',
        departureTime: pastDate.toISOString(),
        arrivalTime: new Date().toISOString(),
        priceBase: 25.0,
      };

      await expect(service.createSchedule(dto)).rejects.toThrow(
        new BadRequestException('Schedule modifications are strictly allowed for future dates only.')
      );
    });

    it('should throw ConflictException if driver is already booked', async () => {
      const futureDep = new Date();
      futureDep.setHours(futureDep.getHours() + 10);
      const futureArr = new Date();
      futureArr.setHours(futureArr.getHours() + 12);

      const dto = {
        routeId: 1,
        busId: 1,
        driverId: 'd1',
        departureTime: futureDep.toISOString(),
        arrivalTime: futureArr.toISOString(),
        priceBase: 25.0,
      };

      mockDataSource.query.mockResolvedValueOnce([{ id: 99 }]); // Driver conflict exists

      await expect(service.createSchedule(dto)).rejects.toThrow(
        new ConflictException('Driver is already booked for another route during this time.')
      );
    });

    it('should throw ConflictException if bus is scrapped or in repair', async () => {
      const futureDep = new Date();
      futureDep.setHours(futureDep.getHours() + 10);
      const futureArr = new Date();
      futureArr.setHours(futureArr.getHours() + 12);

      const dto = {
        routeId: 1,
        busId: 1,
        driverId: 'd1',
        departureTime: futureDep.toISOString(),
        arrivalTime: futureArr.toISOString(),
        priceBase: 25.0,
      };

      mockDataSource.query.mockResolvedValueOnce([]); // No driver conflict
      mockDataSource.query.mockResolvedValueOnce([{ status: 'W serwisie' }]); // Bus check

      await expect(service.createSchedule(dto)).rejects.toThrow(
        new ConflictException('Vehicle is not available for assignment (in repair or scrapped).')
      );
    });

    it('should create schedule and clear timetable cache', async () => {
      const futureDep = new Date();
      futureDep.setHours(futureDep.getHours() + 10);
      const futureArr = new Date();
      futureArr.setHours(futureArr.getHours() + 12);

      const dto = {
        routeId: 1,
        busId: 1,
        driverId: 'd1',
        departureTime: futureDep.toISOString(),
        arrivalTime: futureArr.toISOString(),
        priceBase: 25.0,
      };

      mockDataSource.query.mockResolvedValueOnce([]); // No driver conflict
      mockDataSource.query.mockResolvedValueOnce([{ status: 'Aktywny' }]); // Bus check passes
      mockDataSource.query.mockResolvedValueOnce([]); // No bus conflict
      mockDataSource.query.mockResolvedValueOnce([{ id: 10 }]); // Insert return

      const result = await service.createSchedule(dto);

      expect(result.scheduleId).toBe(10);
      expect(mockPublicInfoService.clearTimetableCache).toHaveBeenCalled();
    });
  });

  describe('assignFleet', () => {
    it('should throw ConflictException if new bus capacity is smaller than active reservations', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ departure_time: '2026-06-15', arrival_time: '2026-06-15' }]); // Schedule check
      mockDataSource.query.mockResolvedValueOnce([{ status: 'Aktywny', capacity: 15 }]); // Bus check
      mockDataSource.query.mockResolvedValueOnce([{ count: '20' }]); // 20 reservations > 15 capacity

      await expect(service.assignFleet(1, { busId: 2 })).rejects.toThrow(
        new ConflictException('Nie można przypisać pojazdu. Liczba aktywnych rezerwacji (20) przekracza pojemność wybranego autobusu (15).')
      );
    });
  });

  describe('updateBusStatus', () => {
    it('should throw BadRequestException for invalid status', async () => {
      await expect(service.updateBusStatus(1, 'NieznanyStatus')).rejects.toThrow(
        /Nieprawidłowy status/
      );
    });

    it('should update bus status in database', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);
      const result = await service.updateBusStatus(1, 'W serwisie');
      expect(result.message).toContain('Bus status updated');
    });
  });

  describe('createBus', () => {
    it('should throw BadRequestException if fields missing or capacity <= 0', async () => {
      await expect(service.createBus({ registrationNumber: '', model: 'A', capacity: 30 })).rejects.toThrow(
        new BadRequestException('Brak wymaganych pól (numer rejestracyjny, model, pojemność).')
      );

      await expect(service.createBus({ registrationNumber: 'KK123', model: 'A', capacity: -5 })).rejects.toThrow(
        new BadRequestException('Pojemność musi być większa od zera.')
      );
    });

    it('should throw ConflictException if registration number exists', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1 }]); // Plate check returns conflict

      await expect(service.createBus({ registrationNumber: 'KK123', model: 'A', capacity: 30 })).rejects.toThrow(
        new ConflictException('Pojazd o tym numerze rejestracyjnym już istnieje.')
      );
    });
  });

  describe('updateBus', () => {
    it('should throw ConflictException if capacity shrink exceeds existing reservations', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // No registration duplicate check conflict
      mockDataSource.query.mockResolvedValueOnce([{ id: 10 }]); // Schedules assigned to this bus
      mockDataSource.query.mockResolvedValueOnce([{ count: '25' }]); // 25 reservations > new capacity 20

      const dto = { registrationNumber: 'KK123', model: 'Model X', capacity: 20 };

      await expect(service.updateBus(1, dto)).rejects.toThrow(
        new ConflictException('Nie można zmniejszyć pojemności autobusu do 20, ponieważ kurs o ID 10 posiada już 25 aktywnych rezerwacji.')
      );
    });
  });

  describe('deleteBus', () => {
    it('should throw ConflictException if bus is assigned to schedules', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 5 }]); // Assigned schedule check returns conflict

      await expect(service.deleteBus(1)).rejects.toThrow(
        new ConflictException('Nie można usunąć pojazdu, ponieważ jest on przypisany do zaplanowanych kursów.')
      );
    });

    it('should delete bus successfully', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // No schedules assigned
      mockDataSource.query.mockResolvedValueOnce([]); // Delete

      const result = await service.deleteBus(1);
      expect(result.message).toContain('Bus deleted successfully');
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return counted dashboard metrics', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ count: '5' }]); // schedules
      mockDataSource.query.mockResolvedValueOnce([{ count: '10' }]); // active buses
      mockDataSource.query.mockResolvedValueOnce([{ count: '150' }]); // total clients

      const result = await service.getDashboardMetrics();
      expect(result).toEqual({
        todaySchedules: 5,
        activeBuses: 10,
        totalClients: 150,
      });
    });
  });
});
