import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService
  ) {}

  async register(body: any) {
    const { email, password, first_name, last_name, phone } = body;
    // Prowizorka, przypisujemy role_id 1 (Klient) sztywno po stronie bazy na start
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    try {
      const result = await this.dataSource.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id) 
         VALUES ($1, $2, $3, $4, $5, 1) RETURNING id, email`,
        [email, hash, first_name, last_name, phone]
      );
      
      // Tworzymy od razu portfel punktów (Trigger w SQL by zrobił to lepiej, ale piszemy to tu)
      await this.dataSource.query(
        `INSERT INTO loyalty_points (user_id) VALUES ($1)`,
        [result[0].id]
      );
      
      return { message: 'Rejestracja udana', user: result[0] };
    } catch (err: any) {
      if (err.code === '23505') {
        throw new ConflictException('Podany adres e-mail jest już zarejestrowany.');
      }
      throw err;
    }
  }

  async login(body: any) {
    const { email, password } = body;
    
    // Szukamy delikwenta w bazie
    const users = await this.dataSource.query(
      `SELECT id, password_hash, failed_login_attempts FROM users WHERE email = $1`,
      [email]
    );

    if (users.length === 0) {
      throw new UnauthorizedException('Błędne dane logowania.');
    }

    const { id, password_hash, failed_login_attempts } = users[0];

    // Sprawdzamy limit logowań - "Blokada konta po 3 nieudanych"
    if (failed_login_attempts >= 3) {
      throw new UnauthorizedException('Konto zostało zablokowane. Skontaktuj się z sekretariatem.');
    }

    const match = await bcrypt.compare(password, password_hash);
    
    if (!match) {
      // Zwiększamy licznik (żeby użytkownik mądrzej wpisywał hasło)
      await this.dataSource.query(
        `UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1`,
        [id]
      );
      throw new UnauthorizedException('Błędne dane logowania.');
    }

    // Reset logowań z sukcesem
    await this.dataSource.query(
      `UPDATE users SET failed_login_attempts = 0 WHERE id = $1`,
      [id]
    );

    const payload = { sub: id, email }; // ładunek do tokena JWT
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

