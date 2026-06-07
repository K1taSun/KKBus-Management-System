import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly LOCK_COOL_DOWN_MINUTES = 15;
  private readonly MAX_FAILED_ATTEMPTS = 3;

  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, first_name, last_name, dateOfBirth, phone, loyaltyProgramConsent } = dto;

    // Walidacja wieku (min. 13 lat)
    const dob = new Date(dateOfBirth);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 13) {
      throw new BadRequestException('Rejestracja dozwolona dla osób powyżej 13 roku życia.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Sprawdzenie czy email już istnieje
      const existingUser = await queryRunner.manager.query(
        `SELECT id FROM users WHERE email = $1`,
        [email],
      );
      if (existingUser.length > 0) {
        throw new ConflictException('Podany adres e-mail jest już zarejestrowany.');
      }

      // 2. Hashowanie hasła
      const saltRounds = 12;
      const hash = await bcrypt.hash(password, saltRounds);

      // 3. Zapis użytkownika (domyślnie rola Klient = 1)
      const userResult = await queryRunner.manager.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, status)
         VALUES ($1, $2, $3, $4, $5, 1, 'active')
         RETURNING id, email`,
        [email, hash, first_name, last_name, phone],
      );
      const userId = userResult[0].id;

      // 4. Generowanie secure token i unikalnego numeru klienta (KKB-YYYY-XXXXXX)
      const activationToken = crypto.randomBytes(32).toString('hex');
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const clientNumber = `KKB-${new Date().getFullYear()}-${randomId}`;

      // 5. Zapis profilu klienta
      await queryRunner.manager.query(
        `INSERT INTO client_profiles (user_id, date_of_birth, client_number, loyalty_opt_in, activation_token)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, dateOfBirth, clientNumber, loyaltyProgramConsent, activationToken],
      );

      // 6. Jeśli wyrażono zgodę, zakładamy portfel punktów lojalnościowych
      if (loyaltyProgramConsent) {
        await queryRunner.manager.query(
          `INSERT INTO loyalty_points (user_id, points_balance) VALUES ($1, 0)`,
          [userId],
        );
      }

      await queryRunner.commitTransaction();

      // Symulacja asynchronicznego wysyłania e-maila aktywacyjnego
      this.sendActivationEmailMock(email, clientNumber, activationToken);

      return {
        message: 'Rejestracja zakończona sukcesem. Sprawdź e-mail w celu aktywacji konta.',
        clientNumber,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const userRes = await this.dataSource.query(
      `SELECT u.id, u.password_hash, u.status, u.suspended_until, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email],
    );

    if (userRes.length === 0) {
      throw new UnauthorizedException('Błędne dane logowania.');
    }

    const user = userRes[0];

    // Sprawdzenie blokady brut-force (sliding window lockout)
    if (user.status === 'blocked') {
      throw new UnauthorizedException('Konto zostało zablokowane z powodu zbyt wielu nieudanych prób logowania. Skontaktuj się z administratorem.');
    }

    // Sprawdzenie zawieszenia konta
    if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
      const remainingTime = Math.ceil(
        (new Date(user.suspended_until).getTime() - Date.now()) / (1000 * 60),
      );
      throw new UnauthorizedException(`Konto jest zawieszone. Spróbuj ponownie za ${remainingTime} min.`);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      await this.handleFailedLogin(email, user.id);
      throw new UnauthorizedException('Błędne dane logowania.');
    }

    // Resetowanie liczników po pomyślnym logowaniu
    await this.dataSource.query(
      `UPDATE users SET failed_login_attempts = 0, status = 'active', suspended_until = NULL WHERE id = $1`,
      [user.id],
    );

    const payload = { sub: user.id, email, role: user.role_name };

    // Generowanie tokenu
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const res = await this.dataSource.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.status, u.created_at,
              cp.date_of_birth, cp.client_number, cp.loyalty_opt_in,
              COALESCE(lp.points_balance, 0) as points_balance,
              r.name as role_name
       FROM users u
       LEFT JOIN client_profiles cp ON u.id = cp.user_id
       LEFT JOIN loyalty_points lp ON u.id = lp.user_id
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId],
    );

    if (res.length === 0) {
      throw new BadRequestException('Użytkownik nie istnieje.');
    }

    const user = res[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      status: user.status,
      createdAt: user.created_at,
      dateOfBirth: user.date_of_birth,
      clientNumber: user.client_number,
      loyaltyOptIn: user.loyalty_opt_in,
      pointsBalance: parseInt(user.points_balance, 10),
      role: user.role_name,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { first_name, last_name, phone } = dto;
    
    const updates: string[] = [];
    const params: any[] = [];

    if (first_name) {
      params.push(first_name);
      updates.push(`first_name = $${params.length}`);
    }
    if (last_name) {
      params.push(last_name);
      updates.push(`last_name = $${params.length}`);
    }
    if (phone) {
      params.push(phone);
      updates.push(`phone = $${params.length}`);
    }

    if (updates.length === 0) {
      throw new BadRequestException('Brak danych do aktualizacji.');
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`;
    await this.dataSource.query(sql, params);

    return { message: 'Profil zaktualizowany pomyślnie.' };
  }

  async getReservationHistory(userId: string) {
    return this.dataSource.query(
      `SELECT r.id, r.seat_number, r.status, r.created_at,
              s.departure_time, s.arrival_time, s.price_base,
              ro.name as route_name, ro.stops, ro.total_distance_km
       FROM reservations r
       JOIN schedules s ON r.schedule_id = s.id
       JOIN routes ro ON s.route_id = ro.id
       WHERE r.user_id = $1
       ORDER BY s.departure_time DESC`,
      [userId],
    );
  }

  private async handleFailedLogin(email: string, userId: string) {
    // 1. Zapisujemy nieudaną próbę w bazie dla analizy okna czasowego (ostatnie 10 minut)
    await this.dataSource.query(
      `INSERT INTO failed_logins (email) VALUES ($1)`,
      [email],
    );

    // 2. Liczymy nieudane próby w ciągu ostatnich 10 minut
    const attemptsRes = await this.dataSource.query(
      `SELECT COUNT(id) as count FROM failed_logins 
       WHERE email = $1 AND attempted_at > NOW() - INTERVAL '10 minutes'`,
      [email],
    );
    
    const failedCount = parseInt(attemptsRes[0].count, 10);

    if (failedCount >= this.MAX_FAILED_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + this.LOCK_COOL_DOWN_MINUTES * 60 * 1000);
      await this.dataSource.query(
        `UPDATE users 
         SET status = 'suspended', suspended_until = $1, failed_login_attempts = $2
         WHERE id = $3`,
        [lockUntil, failedCount, userId],
      );
      // Czyszczenie logów prób
      await this.dataSource.query(`DELETE FROM failed_logins WHERE email = $1`, [email]);
    } else {
      await this.dataSource.query(
        `UPDATE users SET failed_login_attempts = $1 WHERE id = $2`,
        [failedCount, userId],
      );
    }
  }

  private sendActivationEmailMock(email: string, clientNumber: string, activationToken: string) {
    console.log(`[SMTP MOCK] Wysyłanie e-maila aktywacyjnego na adres: ${email} dla klienta: ${clientNumber}. Token: ${activationToken}`);
  }
}
