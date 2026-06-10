import { DriverService } from '../../backend/src/modules/driver/driver.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('DriverService (Unit Tests)', () => {
  let service: DriverService;
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
      manager: {
        query: jest.fn(),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
      query: jest.fn(),
    };

    service = new DriverService(mockDataSource as any);

    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('getSchedulesForDriver', () => {
    it('should return schedules assigned to the driver', async () => {
      const mockSchedules = [
        { id: 1, departure_time: '2026-06-15T10:00:00Z', route_name: 'Trasa A', stops: ['X', 'Y'], registration_number: 'KK123' },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockSchedules);

      const result = await service.getSchedulesForDriver('driver-1');

      expect(result).toEqual(mockSchedules);
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE s.driver_id = $1'),
        ['driver-1']
      );
    });

    it('should return empty array if driver has no schedules', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getSchedulesForDriver('driver-new');

      expect(result).toEqual([]);
    });
  });

  describe('getPassengerManifest', () => {
    it('should throw BadRequestException if driver is not assigned to this schedule', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // schedule check fails

      await expect(service.getPassengerManifest('driver-1', 1)).rejects.toThrow(
        new BadRequestException('You are not assigned to this schedule.')
      );
    });

    it('should throw NotFoundException if no passengers found', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1 }]); // schedule check passes
      mockDataSource.query.mockResolvedValueOnce([]); // no passengers

      await expect(service.getPassengerManifest('driver-1', 1)).rejects.toThrow(
        new NotFoundException('No passengers found for this schedule.')
      );
    });

    it('should return manifest with passenger list and count', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1 }]); // schedule check
      mockDataSource.query.mockResolvedValueOnce([
        { seat_number: 1, first_name: 'Jan', last_name: 'K', phone: '123', status: 'Potwierdzona' },
        { seat_number: 5, first_name: 'Anna', last_name: 'M', phone: '456', status: 'Potwierdzona' },
      ]);

      const result = await service.getPassengerManifest('driver-1', 1);

      expect(result.scheduleId).toBe(1);
      expect(result.totalPassengers).toBe(2);
      expect(result.passengers).toHaveLength(2);
    });
  });

  describe('submitPostTripReport', () => {
    it('should throw BadRequestException if driver is not assigned to schedule', async () => {
      mockQueryRunner.query.mockResolvedValueOnce([]); // schedule check fails

      const dto = {
        scheduleId: 1,
        fuelLiters: 30,
        fuelCost: 200,
        distanceKm: 120,
        presentUserIds: [],
        absentUserIds: [],
      };

      await expect(service.submitPostTripReport('driver-1', dto as any)).rejects.toThrow(
        new BadRequestException('You are not assigned to this schedule.')
      );
    });

    it('should throw BadRequestException if presentUserId is not on the manifest', async () => {
      mockQueryRunner.query.mockResolvedValueOnce([{ id: 1 }]); // schedule check passes
      mockQueryRunner.query.mockResolvedValueOnce([ // valid passengers
        { user_id: 'user-a' },
      ]);

      const dto = {
        scheduleId: 1,
        fuelLiters: 30,
        fuelCost: 200,
        distanceKm: 120,
        presentUserIds: ['user-b'], // not on manifest!
        absentUserIds: [],
      };

      await expect(service.submitPostTripReport('driver-1', dto as any)).rejects.toThrow(
        /nie posiada rezerwacji/
      );
    });

    it('should submit report successfully with fuel metrics', async () => {
      mockQueryRunner.query.mockResolvedValueOnce([{ id: 1 }]); // schedule check
      mockQueryRunner.query.mockResolvedValueOnce([
        { user_id: 'user-a' },
      ]); // valid passengers
      mockQueryRunner.query.mockResolvedValueOnce([]); // insert report
      // loyalty points update
      mockQueryRunner.query.mockResolvedValueOnce([]); // update points
      mockQueryRunner.query.mockResolvedValueOnce([]); // insert transaction

      const dto = {
        scheduleId: 1,
        fuelLiters: 30,
        fuelCost: 200,
        distanceKm: 100,
        presentUserIds: ['user-a'],
        absentUserIds: [],
      };

      const result = await service.submitPostTripReport('driver-1', dto as any);

      expect(result.message).toContain('Report submitted successfully');
      expect(result.metrics.averageFuelConsumption).toBe('2.00'); // 200 / 100
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should handle ConflictException for duplicate reports', async () => {
      mockQueryRunner.query.mockResolvedValueOnce([{ id: 1 }]); // schedule check
      mockQueryRunner.query.mockResolvedValueOnce([]); // valid passengers (empty is fine for no passengers)
      mockQueryRunner.query.mockRejectedValueOnce({ code: '23505' }); // duplicate key

      const dto = {
        scheduleId: 1,
        fuelLiters: 30,
        fuelCost: 200,
        distanceKm: 100,
        presentUserIds: [],
        absentUserIds: [],
      };

      await expect(service.submitPostTripReport('driver-1', dto as any)).rejects.toThrow(
        new ConflictException('Report for this schedule already exists.')
      );
    });
  });

  describe('setAvailability', () => {
    it('should throw BadRequestException for past dates', async () => {
      const dto = { availableDate: '2026-06-09', status: 'Dostępny' };

      await expect(service.setAvailability('driver-1', dto as any)).rejects.toThrow(
        new BadRequestException('Availability can only be set for future dates.')
      );
    });

    it('should throw BadRequestException for today', async () => {
      const dto = { availableDate: '2026-06-10', status: 'Dostępny' };

      await expect(service.setAvailability('driver-1', dto as any)).rejects.toThrow(
        new BadRequestException('Availability can only be set for future dates.')
      );
    });

    it('should throw ConflictException when setting unavailable but already assigned', async () => {
      mockDataSource.query.mockResolvedValueOnce([{ id: 1 }]); // schedule conflict exists

      const dto = { availableDate: '2026-06-15', status: 'Niedostępny' };

      await expect(service.setAvailability('driver-1', dto as any)).rejects.toThrow(
        new ConflictException('Driver is already assigned to a schedule on this date.')
      );
    });

    it('should upsert availability for a future date', async () => {
      mockDataSource.query.mockResolvedValueOnce([]); // no schedule conflict

      const dto = { availableDate: '2026-06-15', status: 'Niedostępny' };

      // The upsert query
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.setAvailability('driver-1', dto as any);

      expect(result.message).toContain('Availability updated');
    });

    it('should allow setting available status without conflict check', async () => {
      // For "Dostępny" status, no conflict check is needed
      mockDataSource.query.mockResolvedValueOnce([]); // upsert

      const dto = { availableDate: '2026-06-15', status: 'Dostępny' };

      const result = await service.setAvailability('driver-1', dto as any);

      expect(result.message).toContain('Availability updated');
    });
  });

  describe('deleteAvailability', () => {
    it('should throw BadRequestException if date parameter is missing', async () => {
      await expect(service.deleteAvailability('driver-1', '')).rejects.toThrow(
        new BadRequestException('Date parameter is required')
      );
    });

    it('should delete availability for the given date', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.deleteAvailability('driver-1', '2026-06-15');

      expect(result.message).toContain('Availability deleted');
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM driver_availability'),
        ['driver-1', '2026-06-15']
      );
    });
  });

  describe('submitInspection', () => {
    it('should submit a vehicle inspection record', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const dto = {
        busId: 1,
        type: 'PRE_TRIP',
        mileage: 15000,
        fuelLevel: 80,
        lightsOk: true,
        tiresOk: true,
        interiorOk: true,
        fluidsOk: true,
        emergencyEquipmentOk: true,
        keysReturned: null,
        notes: 'Brak uwag',
        scheduleId: null,
      };

      const result = await service.submitInspection('driver-1', dto as any);

      expect(result.message).toContain('Inspection submitted');
    });
  });

  describe('submitDefect', () => {
    it('should submit a vehicle defect report', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const dto = {
        busId: 1,
        severity: 'MEDIUM',
        description: 'Broken window',
        scheduleId: null,
      };

      const result = await service.submitDefect('driver-1', dto as any, 'http://photo.url/img.jpg');

      expect(result.message).toContain('Defect reported');
    });

    it('should submit defect without photo URL', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const dto = {
        busId: 1,
        severity: 'LOW',
        description: 'Minor scratch',
        scheduleId: null,
      };

      const result = await service.submitDefect('driver-1', dto as any);

      expect(result.message).toContain('Defect reported');
    });
  });

  describe('triggerSOS', () => {
    it('should insert SOS alert into database', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const dto = {
        busId: 1,
        scheduleId: 5,
        latitude: 50.0647,
        longitude: 19.9450,
      };

      const result = await service.triggerSOS('driver-1', dto as any);

      expect(result.message).toContain('SOS alert triggered');
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sos_alerts'),
        ['driver-1', 5, 1, 50.0647, 19.9450]
      );
    });
  });

  describe('getVehicleDocuments', () => {
    it('should return vehicle documents for given bus', async () => {
      const mockDocs = [
        { doc_type: 'insurance', expiry_date: '2027-01-01', document_url: 'http://docs/ins.pdf' },
      ];
      mockDataSource.query.mockResolvedValueOnce(mockDocs);

      const result = await service.getVehicleDocuments(1);

      expect(result).toEqual(mockDocs);
    });

    it('should return empty array when bus has no documents', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const result = await service.getVehicleDocuments(999);

      expect(result).toEqual([]);
    });
  });
});
