import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, mockDataSourceObj, mockQueryRunnerObj } from './setup';
import * as bcrypt from 'bcrypt';
import { JwtService } from '../../backend/node_modules/@nestjs/jwt';

describe('Auth Module (Integration Tests)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    app = await createTestApp(mockDataSourceObj);
    jwtService = app.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 Bad Request if validation fails (e.g. invalid email)', async () => {
      const invalidDto = {
        email: 'not-an-email',
        password: '123',
        first_name: 'J',
        last_name: 'K',
        dateOfBirth: '2020-01-01',
        phone: '123',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);
    });

    it('should register successfully when valid data is supplied', async () => {
      const validDto = {
        email: 'test-integration@example.com',
        password: 'SecurePassword123!',
        first_name: 'Jan',
        last_name: 'Kowalski',
        dateOfBirth: '1990-01-01',
        phone: '123456789',
        loyaltyProgramConsent: true,
      };

      // Mock database calls for successful registration:
      // 1. Email check (returns empty list = email free)
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);
      // 2. User insert (returns id)
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([{ id: 'new-user-id', email: 'test-integration@example.com' }]);
      // 3. Profile insert
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);
      // 4. Loyalty wallet insert
      mockQueryRunnerObj.manager.query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(validDto)
        .expect(201);

      expect(response.body.message).toContain('sukcesem');
      expect(response.body.clientNumber).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should set HttpOnly cookies on successful login', async () => {
      const password = 'CorrectPassword123';
      const passwordHash = await bcrypt.hash(password, 10);

      // Mock database queries for login:
      // 1. User search returning user row
      mockDataSourceObj.query.mockResolvedValueOnce([
        {
          id: 'user-id-123',
          password_hash: passwordHash,
          status: 'active',
          suspended_until: null,
          role_name: 'Klient',
        },
      ]);
      // 2. Reset failed login attempts
      mockDataSourceObj.query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login-integration@example.com', password })
        .expect(201);

      expect(response.body.message).toContain('Zalogowano pomyślnie');
      expect(response.body.role).toBe('Klient');

      // Verify that accessToken and refreshToken cookies are set
      const cookies = response.headers['set-cookie'] as any;
      expect(cookies).toBeDefined();
      
      const hasAccessTokenCookie = cookies.some(c => c.startsWith('accessToken='));
      const hasRefreshTokenCookie = cookies.some(c => c.startsWith('refreshToken='));
      
      expect(hasAccessTokenCookie).toBe(true);
      expect(hasRefreshTokenCookie).toBe(true);
    });

    it('should return 401 Unauthorized on incorrect password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPassword123', 10);

      mockDataSourceObj.query.mockResolvedValueOnce([
        {
          id: 'user-id-123',
          password_hash: passwordHash,
          status: 'active',
          suspended_until: null,
          role_name: 'Klient',
        },
      ]);

      // Mock failed login database handler queries:
      // 1. Insert failed attempt
      mockDataSourceObj.query.mockResolvedValueOnce([]);
      // 2. Count failed attempts (returns 1)
      mockDataSourceObj.query.mockResolvedValueOnce([{ count: '1' }]);
      // 3. Update attempts count in user row
      mockDataSourceObj.query.mockResolvedValueOnce([]);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'login-integration@example.com', password: 'WrongPassword' })
        .expect(401);

      expect(response.body.message).toContain('Błędne dane logowania');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 401 if request does not contain token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should return user profile if valid token is provided in cookie', async () => {
      const payload = { sub: 'user-id-123', email: 'user@example.com', role: 'Klient' };
      const testToken = jwtService.sign(payload);

      // Mock database query for getProfile
      mockDataSourceObj.query.mockResolvedValueOnce([
        {
          id: 'user-id-123',
          email: 'user@example.com',
          first_name: 'Jan',
          last_name: 'Kowalski',
          phone: '123456789',
          status: 'active',
          created_at: new Date().toISOString(),
          date_of_birth: '1990-01-01',
          client_number: 'KKB-2026-123456',
          loyalty_opt_in: true,
          points_balance: '150',
          role_name: 'Klient',
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Cookie', [`accessToken=${testToken}`])
        .expect(200);

      expect(response.body.id).toBe('user-id-123');
      expect(response.body.email).toBe('user@example.com');
      expect(response.body.pointsBalance).toBe(150);
      expect(response.body.role).toBe('Klient');
    });
  });
});
