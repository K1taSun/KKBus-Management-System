import { AuthService } from '../../backend/src/modules/auth/auth.service';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let mockDataSource: any;
  let mockQueryRunner: any;
  let mockJwtService: any;

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

    mockJwtService = {
      sign: jest.fn(),
    };

    authService = new AuthService(mockDataSource as any, mockJwtService as any);

    // Freeze system time using Jest fake timers: June 10, 2026, 12:00:00 UTC
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('should throw BadRequestException if user is under 13 years old', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        first_name: 'Jan',
        last_name: 'Kowalski',
        dateOfBirth: '2015-06-10', // 11 years old in 2026
        phone: '123456789',
        loyaltyProgramConsent: true,
      };

      await expect(authService.register(registerDto)).rejects.toThrow(
        new BadRequestException('Rejestracja dozwolona dla osób powyżej 13 roku życia.')
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        email: 'exists@example.com',
        password: 'Password123!',
        first_name: 'Jan',
        last_name: 'Kowalski',
        dateOfBirth: '1995-05-05', // 31 years old
        phone: '123456789',
        loyaltyProgramConsent: true,
      };

      // Mock user search query returning existing user id
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ id: 'existing-id' }]);

      await expect(authService.register(registerDto)).rejects.toThrow(
        new ConflictException('Podany adres e-mail jest już zarejestrowany.')
      );
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it('should register successfully and create loyalty wallet if consent is given', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'Password123!',
        first_name: 'Jan',
        last_name: 'Kowalski',
        dateOfBirth: '1995-05-05',
        phone: '123456789',
        loyaltyProgramConsent: true,
      };

      // Mock sequence of queries:
      // 1. Email check (no user found)
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // 2. User insertion (returns user ID)
      mockQueryRunner.manager.query.mockResolvedValueOnce([{ id: 'new-user-id', email: 'new@example.com' }]);
      // 3. Profile insertion
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);
      // 4. Loyalty wallet insertion
      mockQueryRunner.manager.query.mockResolvedValueOnce([]);

      const result = await authService.register(registerDto);

      expect(result.message).toContain('Rejestracja zakończona sukcesem');
      expect(result.clientNumber).toBeDefined();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user does not exist', async () => {
      mockDataSource.query.mockResolvedValueOnce([]);

      const loginDto = { email: 'nonexistent@example.com', password: 'Password123!' };

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Błędne dane logowania.')
      );
    });

    it('should throw UnauthorizedException if account is permanently blocked', async () => {
      mockDataSource.query.mockResolvedValueOnce([
        { id: '1', password_hash: 'hash', status: 'blocked', suspended_until: null, role_name: 'Klient' }
      ]);

      const loginDto = { email: 'blocked@example.com', password: 'Password123!' };

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Konto zostało zablokowane z powodu zbyt wielu nieudanych prób logowania. Skontaktuj się z administratorem.')
      );
    });

    it('should throw UnauthorizedException with remaining suspension minutes if account is suspended', async () => {
      // Set suspended_until to 10 minutes in the future relative to the mocked Date.now()
      const suspendedUntil = new Date(Date.now() + 10 * 60 * 1000);
      mockDataSource.query.mockResolvedValueOnce([
        { id: '1', password_hash: 'hash', status: 'suspended', suspended_until: suspendedUntil, role_name: 'Klient' }
      ]);

      const loginDto = { email: 'suspended@example.com', password: 'Password123!' };

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Konto jest zawieszone. Spróbuj ponownie za 10 min.')
      );
    });

    it('should successfully log in, generate tokens, and reset failed attempts on correct password', async () => {
      const password = 'Password123!';
      const hash = await bcrypt.hash(password, 10);

      mockDataSource.query.mockResolvedValueOnce([
        { id: 'user-id', password_hash: hash, status: 'active', suspended_until: null, role_name: 'Klient' }
      ]);

      mockJwtService.sign.mockReturnValueOnce('mock-access-token');
      mockJwtService.sign.mockReturnValueOnce('mock-refresh-token');

      const loginDto = { email: 'login@example.com', password };
      const result = await authService.login(loginDto);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      expect(mockDataSource.query).toHaveBeenLastCalledWith(
        expect.stringContaining('UPDATE users SET failed_login_attempts = 0'),
        ['user-id']
      );
    });

    it('should handle failed login, increments count, and suspend user if failed attempts >= 3', async () => {
      const password = 'WrongPassword';
      const hash = await bcrypt.hash('CorrectPassword', 10);

      mockDataSource.query.mockResolvedValueOnce([
        { id: 'user-id', password_hash: hash, status: 'active', suspended_until: null, role_name: 'Klient' }
      ]);

      // Mock handleFailedLogin database operations:
      // 1. Insert into failed_logins
      mockDataSource.query.mockResolvedValueOnce([]);
      // 2. Count failed logins (returns 3 attempts)
      mockDataSource.query.mockResolvedValueOnce([{ count: '3' }]);
      // 3. Update users status to suspended
      mockDataSource.query.mockResolvedValueOnce([]);

      const loginDto = { email: 'bruteforce@example.com', password };

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Błędne dane logowania.')
      );

      // Verify that suspension query was triggered (contains 'suspended')
      expect(mockDataSource.query).toHaveBeenCalledWith(
        expect.stringContaining("status = 'suspended'"),
        [expect.any(Date), 3, 'user-id']
      );
    });
  });
});
