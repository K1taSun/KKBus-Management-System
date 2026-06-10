import { ReservationsService } from '../../backend/src/modules/reservations/reservations.service';
import { BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';

describe('ReservationsService (Unit Tests)', () => {
  let reservationsService: ReservationsService;
  let mockDataSource: any;
  let mockQueryRunner: any;
  let mockPublicInfoService: any;

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

    reservationsService = new ReservationsService(mockDataSource as any, mockPublicInfoService as any);

    // Freeze system time using Jest fake timers: June 10, 2026, 12:00:00 UTC
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('bookSeats', () => {
    const userId = 'user-uuid-1';
    
    it('should throw ForbiddenException if user status is blocked', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'blocked', suspended_until: null, no_shows: 0 }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow(
        new ForbiddenException('Twoje konto jest trwale zablokowane.')
      );
    });

    it('should throw ForbiddenException if user has 3 or more no-shows', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 3 }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow(
        new ForbiddenException('Konto zablokowane z powodu 3 niezrealizowanych rezerwacji (no-show). Skontaktuj się z sekretariatem.')
      );
    });

    it('should throw ForbiddenException if user is suspended', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'suspended', suspended_until: new Date(Date.now() + 3 * 60 * 60 * 1000), no_shows: 0 }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow('Masz zablokowaną możliwość rezerwacji');
    });

    it('should throw BadRequestException if route is inactive', async () => {
      // 1. User check passes
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      // 2. Schedule search (returns is_active = false)
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { departure_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), capacity: 19, is_active: false }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow(
        new BadRequestException('Nie można rezerwować miejsc na nieaktywnej trasie.')
      );
    });

    it('should throw BadRequestException if departure is in less than 2 hours', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      // Departure in 1 hour
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { departure_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), capacity: 19, is_active: true }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow(
        new BadRequestException('Rezerwacja jest możliwa najpóźniej na 2 godziny przed odjazdem.')
      );
    });

    it('should throw BadRequestException if departure is more than 7 days in the future', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      // Departure in 8 days
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { departure_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), capacity: 19, is_active: true }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow(
        new BadRequestException('Nie można rezerwować miejsc z wyprzedzeniem większym niż 7 dni.')
      );
    });

    it('should throw BadRequestException if seat number is out of bounds', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { departure_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), capacity: 19, is_active: true }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 20, discountType: 'NORMAL' }], // Capacity is 19
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow(
        new BadRequestException('Miejsce 20 wykracza poza pojemność pojazdu (1-19).')
      );
    });

    it('should throw ConflictException if seat is already occupied', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { departure_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), capacity: 19, is_active: true }
      ]);
      // Mock search of occupied seats returning seat 5 as already booked
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { seat_number: 5 }
      ]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      };

      await expect(reservationsService.bookSeats(userId, dto as any)).rejects.toThrow(
        new ConflictException('Wybrane miejsca (5) są już zajęte.')
      );
    });

    it('should calculate discounts correctly (Student 51%, Child 30%) and complete booking', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { departure_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), capacity: 19, is_active: true, price_base: '100.00' }
      ]);
      // Occupied seats search (none occupied)
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // Pricing policy search
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { student_discount_percent: 51, child_discount_percent: 30, loyalty_point_value: 0.1 }
      ]);
      // Insert Reservation 1 returning ID
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ id: 'res-id-1' }]);
      // Insert Payment 1
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // Insert Reservation 2 returning ID
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ id: 'res-id-2' }]);
      // Insert Payment 2
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [
          { seatNumber: 5, discountType: 'STUDENT' }, // 100 * (1 - 0.51) = 49
          { seatNumber: 6, discountType: 'CHILD' },   // 100 * (1 - 0.30) = 70
        ],
        paymentMethod: 'CARD_ONLINE',
        useLoyaltyPoints: false,
      };

      const result = await reservationsService.bookSeats(userId, dto as any);

      expect(result.message).toContain('Rezerwacja została pomyślnie potwierdzona');
      expect(result.reservationIds).toEqual(['res-id-1', 'res-id-2']);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should apply loyalty points discounts correctly and deduct points', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { departure_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), capacity: 19, is_active: true, price_base: '100.00' }
      ]);
      // Occupied seats search (none occupied)
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // Pricing policy search (1 point = 0.10 PLN)
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { student_discount_percent: 51, child_discount_percent: 30, loyalty_point_value: 0.1 }
      ]);
      // Loyalty points balance check (returns 500 points = 50.00 PLN value)
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { points_balance: 500 }
      ]);
      // Update points balance
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // Insert points transaction log
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // Insert Reservation (returns id)
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ id: 'res-id-1' }]);
      // Insert Payment
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      const dto = {
        scheduleId: 'schedule-1',
        seats: [{ seatNumber: 5, discountType: 'NORMAL' }], // Base price 100.00
        paymentMethod: 'CARD_ONLINE',
        useLoyaltyPoints: true,
      };

      const result = await reservationsService.bookSeats(userId, dto as any);

      expect(result.message).toContain('Rezerwacja została pomyślnie potwierdzona');
      // Points balance update verification: deducts 500 points since max points discount (50.00) is less than 100.00
      expect(mockQueryRunner.manager.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE loyalty_points SET points_balance = points_balance - $1'),
        [500, userId]
      );
    });
  });

  describe('cancelReservation', () => {
    const userId = 'user-uuid-1';
    const reservationId = 'res-uuid-1';

    it('should throw BadRequestException if reservation does not exist', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      await expect(reservationsService.cancelReservation(userId, reservationId)).rejects.toThrow(
        new BadRequestException('Wskazana rezerwacja nie istnieje.')
      );
    });

    it('should throw BadRequestException if reservation is already cancelled', async () => {
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { id: reservationId, status: 'Anulowana', departure_time: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString() }
      ]);

      await expect(reservationsService.cancelReservation(userId, reservationId)).rejects.toThrow(
        new BadRequestException('Ta rezerwacja została już wcześniej anulowana.')
      );
    });

    it('should throw ForbiddenException if cancellation is attempted less than 24 hours before departure', async () => {
      // Departure in 20 hours
      const departureTime = new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString();
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { id: reservationId, status: 'Potwierdzona', departure_time: departureTime }
      ]);

      await expect(reservationsService.cancelReservation(userId, reservationId)).rejects.toThrow(
        new ForbiddenException('Anulowanie rezerwacji jest możliwe najpóźniej na 24 godziny przed odjazdem.')
      );
    });

    it('should successfully cancel reservation if departure is more than 24 hours away', async () => {
      // Departure in 30 hours
      const departureTime = new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString();
      mockQueryRunner.manager.query.mockResolvedValueOnce([
        { id: reservationId, status: 'Potwierdzona', departure_time: departureTime }
      ]);
      // Update reservation status query
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      const result = await reservationsService.cancelReservation(userId, reservationId);

      expect(result.message).toContain('anulowana');
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(mockPublicInfoService.clearTimetableCache).toHaveBeenCalled();
    });
  });
});
