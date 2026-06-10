import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, mockDataSourceObj, mockQueryRunnerObj } from './setup';
import { JwtService } from '../../backend/node_modules/@nestjs/jwt';

describe('Reservations Module (Integration Tests)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let testToken: string;

  beforeAll(async () => {
    app = await createTestApp(mockDataSourceObj);
    jwtService = app.get<JwtService>(JwtService);
    
    // Create a mock token for an active user
    const payload = { sub: 'user-id-123', email: 'user@example.com', role: 'Klient' };
    testToken = jwtService.sign(payload);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/reservations', () => {
    it('should return 401 Unauthorized if no JWT token is supplied', async () => {
      await request(app.getHttpServer())
        .post('/api/reservations')
        .send({
          scheduleId: 1,
          seats: [{ seatNumber: 5, discountType: 'NORMAL' }],
          paymentMethod: 'ON_BOARD',
          useLoyaltyPoints: false,
        })
        .expect(401);
    });

    it('should return 400 Bad Request if validation of DTO fails', async () => {
      // Empty seats array should trigger validation error
      await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Cookie', [`accessToken=${testToken}`])
        .send({
          scheduleId: '',
          seats: [],
          paymentMethod: 'ON_BOARD',
          useLoyaltyPoints: false,
        })
        .expect(400);
    });

    it('should book seat successfully if valid JWT and payload are supplied', async () => {
      // Mock db sequence:
      // 1. User check (active, no penalties, no suspensions)
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([
        { status: 'active', suspended_until: null, no_shows: 0 }
      ]);
      // 2. Schedule lookup (active route, capacity = 19, departure in 24 hours)
      const departureTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([
        { departure_time: departureTime, capacity: 19, is_active: true, price_base: '20.00' }
      ]);
      // 3. Occupied seats check (none occupied)
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);
      // 4. Pricing policy lookup
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([
        { student_discount_percent: 51, child_discount_percent: 30, loyalty_point_value: 0.1 }
      ]);
      // 5. Insert reservation returning id
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([{ id: 'new-reservation-id-123' }]);
      // 6. Insert payment
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .post('/api/reservations')
        .set('Cookie', [`accessToken=${testToken}`])
        .send({
          scheduleId: 1,
          seats: [{ seatNumber: 12, discountType: 'NORMAL' }],
          paymentMethod: 'ON_BOARD',
          useLoyaltyPoints: false,
        })
        .expect(201);

      expect(response.body.message).toContain('pomyślnie potwierdzona');
      expect(response.body.reservationIds).toEqual(['new-reservation-id-123']);
      expect(mockQueryRunnerObj.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('POST /api/reservations/guest', () => {
    it('should book guest seat successfully and create guest account', async () => {
      // Mock db sequence:
      // 1. Existing user check (returns empty = new user)
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);
      // 2. Insert user
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([{ id: 'new-guest-user-id' }]);
      // 3. Insert profile
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);
      // 4. Schedule lookup (active, capacity = 19, departure in 24h)
      const departureTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([
        { departure_time: departureTime, capacity: 19, is_active: true, price_base: '20.00', route_name: 'Kraków - Katowice' }
      ]);
      // 5. Occupied check (none)
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);
      // 6. Pricing policy
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([
        { student_discount_percent: 51, child_discount_percent: 30 }
      ]);
      // 7. Insert reservation
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([{ id: 'guest-reservation-id' }]);
      // 8. Insert payment
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .post('/api/reservations/guest')
        .send({
          scheduleId: 1,
          seats: [{ seatNumber: 3, discountType: 'STUDENT' }],
          paymentMethod: 'BLIK',
          email: 'guest@example.com',
          first_name: 'Anna',
          last_name: 'Nowak',
          phone: '+48987654321',
        })
        .expect(201);

      expect(response.body.message).toContain('gościa została pomyślnie potwierdzona');
      expect(response.body.email).toBe('guest@example.com');
      expect(response.body.guestAccount).toBeDefined();
      expect(response.body.guestAccount.password).toBeDefined();
      expect(mockQueryRunnerObj.commitTransaction).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/reservations/:id', () => {
    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/api/reservations/res-id')
        .expect(401);
    });

    it('should cancel reservation successfully when valid reservation and time window are found', async () => {
      // Mock db sequence:
      // 1. Fetch reservation and schedule details (departure in 48 hours)
      const departureTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([
        { id: 'res-id', status: 'Potwierdzona', departure_time: departureTime }
      ]);
      // 2. Update status query
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .delete('/api/reservations/res-id')
        .set('Cookie', [`accessToken=${testToken}`])
        .expect(200);

      expect(response.body.message).toContain('anulowana');
      expect(mockQueryRunnerObj.commitTransaction).toHaveBeenCalled();
    });
  });
});
