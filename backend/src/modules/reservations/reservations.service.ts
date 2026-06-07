import { Injectable, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { BookSeatsDto } from './dto/book-seats.dto';
import { GuestBookSeatsDto } from './dto/guest-book-seats.dto';
import { PublicInfoService } from '../public-info/public-info.service';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly publicInfoService: PublicInfoService,
  ) {}

  async bookSeats(userId: string, dto: BookSeatsDto) {
    const { scheduleId, seatNumbers } = dto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    // SERIALIZABLE zapobiega race conditions podczas współbieżnych rezerwacji
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Sprawdzenie statusu klienta (zawieszenia / blokady / no-shows)
      const userRes = await queryRunner.manager.query(
        `SELECT status, suspended_until, no_shows FROM users WHERE id = $1`,
        [userId],
      );
      if (userRes.length === 0) {
        throw new BadRequestException('Użytkownik nie istnieje.');
      }
      
      const user = userRes[0];
      if (user.status === 'blocked') {
        throw new ForbiddenException('Twoje konto jest trwale zablokowane.');
      }

      if (user.no_shows >= 3) {
        throw new ForbiddenException('Konto zablokowane z powodu 3 niezrealizowanych rezerwacji (no-show). Skontaktuj się z sekretariatem.');
      }

      if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
        throw new ForbiddenException(
          `Masz zablokowaną możliwość rezerwacji ze względu na kary do ${new Date(user.suspended_until).toLocaleString('pl-PL')}.`,
        );
      }

      // 2. Sprawdzenie szczegółów kursu i aktywności trasy
      const scheduleRes = await queryRunner.manager.query(
        `SELECT s.departure_time, b.capacity, r.is_active
         FROM schedules s
         JOIN buses b ON s.bus_id = b.id
         JOIN routes r ON s.route_id = r.id
         WHERE s.id = $1 FOR UPDATE`, // Blokada na poziomie wiersza
        [scheduleId],
      );

      if (scheduleRes.length === 0) {
        throw new BadRequestException('Wybrany kurs nie istnieje.');
      }

      if (!scheduleRes[0].is_active) {
        throw new BadRequestException('Nie można rezerwować miejsc na nieaktywnej trasie.');
      }

      const { departure_time, capacity } = scheduleRes[0];
      const departureDate = new Date(departure_time);
      const now = new Date();

      // Walidacja temporalna: Rezerwacja możliwa najpóźniej na 2h przed odjazdem
      const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilDeparture < 2) {
        throw new BadRequestException('Rezerwacja jest możliwa najpóźniej na 2 godziny przed odjazdem.');
      }

      // Walidacja temporalna: Rezerwacja możliwa maksymalnie 7 dni przed odjazdem
      const daysUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilDeparture > 7) {
        throw new BadRequestException('Nie można rezerwować miejsc z wyprzedzeniem większym niż 7 dni.');
      }

      // 3. Walidacja pojemności i poprawności numerów siedzeń
      for (const seat of seatNumbers) {
        if (seat < 1 || seat > capacity) {
          throw new BadRequestException(`Miejsce ${seat} wykracza poza pojemność pojazdu (1-${capacity}).`);
        }
      }

      // 4. Sprawdzenie czy wybrane miejsca są już zajęte
      const occupiedSeatsRes = await queryRunner.manager.query(
        `SELECT seat_number FROM reservations 
         WHERE schedule_id = $1 AND status != 'Anulowana' AND seat_number = ANY($2::int[])`,
        [scheduleId, seatNumbers],
      );

      if (occupiedSeatsRes.length > 0) {
        const occupiedList = occupiedSeatsRes.map((r: any) => r.seat_number).join(', ');
        throw new ConflictException(`Wybrane miejsca (${occupiedList}) są już zajęte.`);
      }

      // 5. Zapis rezerwacji w bazie danych
      const reservationIds: string[] = [];
      for (const seat of seatNumbers) {
        const res = await queryRunner.manager.query(
          `INSERT INTO reservations (schedule_id, user_id, seat_number, status) 
           VALUES ($1, $2, $3, 'Potwierdzona') RETURNING id`,
          [scheduleId, userId, seat],
        );
        reservationIds.push(res[0].id);
      }

      await queryRunner.commitTransaction();

      // Inwalidacja cache rozkładu jazdy
      this.publicInfoService.clearTimetableCache();

      // Asynchroniczne powiadomienie e-mail (mock)
      this.sendReservationEmailMock(userId, reservationIds);

      return {
        message: 'Rezerwacja została pomyślnie potwierdzona.',
        reservationIds,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelReservation(userId: string, reservationId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Pobieramy rezerwację i czas odjazdu
      const resResult = await queryRunner.manager.query(
        `SELECT r.id, r.status, s.departure_time 
         FROM reservations r
         JOIN schedules s ON r.schedule_id = s.id
         WHERE r.id = $1 AND r.user_id = $2 FOR UPDATE`,
        [reservationId, userId],
      );

      if (resResult.length === 0) {
        throw new BadRequestException('Wskazana rezerwacja nie istnieje.');
      }

      const reservation = resResult[0];

      if (reservation.status === 'Anulowana') {
        throw new BadRequestException('Ta rezerwacja została już wcześniej anulowana.');
      }

      // 2. Walidacja okna czasowego (min. 24h na anulowanie)
      const departureTime = new Date(reservation.departure_time);
      const hoursUntilDeparture = (departureTime.getTime() - Date.now()) / (1000 * 60 * 60);

      if (hoursUntilDeparture < 24) {
        throw new ForbiddenException('Anulowanie rezerwacji jest możliwe najpóźniej na 24 godziny przed odjazdem.');
      }

      // 3. Aktualizacja statusu
      await queryRunner.manager.query(
        `UPDATE reservations SET status = 'Anulowana' WHERE id = $1`,
        [reservationId],
      );

      await queryRunner.commitTransaction();
      
      // Inwalidacja cache rozkładu jazdy
      this.publicInfoService.clearTimetableCache();

      return { message: 'Rezerwacja została pomyślnie anulowana. Miejsce zostało zwolnione.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private sendReservationEmailMock(userId: string, reservationIds: string[]) {
    console.log(`[SMTP MOCK] Wysłano bilet na maila użytkownika: ${userId} dla rezerwacji: [${reservationIds.join(', ')}]`);
  }

  async bookSeatsGuest(dto: GuestBookSeatsDto) {
    const { scheduleId, seatNumbers, email, first_name, last_name, phone } = dto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Sprawdzenie czy użytkownik o takim e-mailu już istnieje
      let userId: string;
      let clientNumber: string;
      let guestPassword: string | null = null; // zwrócone tylko dla nowych kont gościnnych

      const existingUser = await queryRunner.manager.query(
        `SELECT u.id, u.status, u.suspended_until, u.no_shows, cp.client_number
         FROM users u
         LEFT JOIN client_profiles cp ON u.id = cp.user_id
         WHERE u.email = $1`,
        [email],
      );

      if (existingUser.length > 0) {
        const user = existingUser[0];
        if (user.status === 'blocked') {
          throw new ForbiddenException('Konto powiązane z tym e-mailem jest zablokowane.');
        }
        if (user.no_shows >= 3) {
          throw new ForbiddenException('Konto powiązane z tym e-mailem jest zablokowane z powodu 3 niezrealizowanych rezerwacji.');
        }
        if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
          throw new ForbiddenException(`Konto powiązane z tym e-mailem ma zawieszoną możliwość rezerwacji do ${new Date(user.suspended_until).toLocaleString('pl-PL')}.`);
        }
        userId = user.id;
        clientNumber = user.client_number || 'KKB-GUEST';
      } else {
        // Tworzymy nowe konto dla gościa na podstawie danych checkoutu
        // Konto gościa — hasło generowane kryptograficznie bezpiecznym RNG.
        // Zwracamy je w odpowiedzi — jest to jedyna szansa aby gość mógł zalogować się na swoje konto.
        const tempPassword = crypto.randomBytes(16).toString('hex');
        guestPassword = tempPassword;
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        
        const userInsert = await queryRunner.manager.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, status)
           VALUES ($1, $2, $3, $4, $5, 1, 'active')
           RETURNING id`,
          [email, passwordHash, first_name, last_name, phone],
        );
        userId = userInsert[0].id;

        // Generowanie numeru klienta
        const randomId = Math.floor(100000 + Math.random() * 900000);
        clientNumber = `KKB-${new Date().getFullYear()}-${randomId}`;

        // Zapis profilu klienta (domyślnie data urodzenia placeholder dla gościa)
        await queryRunner.manager.query(
          `INSERT INTO client_profiles (user_id, date_of_birth, client_number, loyalty_opt_in)
           VALUES ($1, '2000-01-01', $2, FALSE)`,
          [userId, clientNumber],
        );
      }

      // 2. Pobranie szczegółów kursu
      const scheduleRes = await queryRunner.manager.query(
        `SELECT s.departure_time, b.capacity, r.name as route_name, r.is_active
         FROM schedules s
         JOIN buses b ON s.bus_id = b.id
         JOIN routes r ON s.route_id = r.id
         WHERE s.id = $1 FOR UPDATE`,
        [scheduleId],
      );

      if (scheduleRes.length === 0) {
        throw new BadRequestException('Wybrany kurs nie istnieje.');
      }

      if (!scheduleRes[0].is_active) {
        throw new BadRequestException('Nie można rezerwować miejsc na nieaktywnej trasie.');
      }

      const { departure_time, capacity, route_name } = scheduleRes[0];
      const departureDate = new Date(departure_time);
      const now = new Date();

      // Walidacja temporalna: Rezerwacja możliwa najpóźniej na 2h przed odjazdem
      const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilDeparture < 2) {
        throw new BadRequestException('Rezerwacja jest możliwa najpóźniej na 2 godziny przed odjazdem.');
      }

      // Walidacja temporalna: Rezerwacja możliwa maksymalnie 7 dni przed odjazdem
      const daysUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilDeparture > 7) {
        throw new BadRequestException('Nie można rezerwować miejsc z wyprzedzeniem większym niż 7 dni.');
      }

      // 3. Walidacja siedzeń
      for (const seat of seatNumbers) {
        if (seat < 1 || seat > capacity) {
          throw new BadRequestException(`Miejsce ${seat} wykracza poza pojemność pojazdu (1-${capacity}).`);
        }
      }

      // 4. Sprawdzenie zajętości
      const occupiedSeatsRes = await queryRunner.manager.query(
        `SELECT seat_number FROM reservations 
         WHERE schedule_id = $1 AND status != 'Anulowana' AND seat_number = ANY($2::int[])`,
        [scheduleId, seatNumbers],
      );

      if (occupiedSeatsRes.length > 0) {
        const occupiedList = occupiedSeatsRes.map((r: any) => r.seat_number).join(', ');
        throw new ConflictException(`Wybrane miejsca (${occupiedList}) są już zajęte.`);
      }

      // 5. Zapis rezerwacji
      const reservationIds: string[] = [];
      for (const seat of seatNumbers) {
        const res = await queryRunner.manager.query(
          `INSERT INTO reservations (schedule_id, user_id, seat_number, status) 
           VALUES ($1, $2, $3, 'Potwierdzona') RETURNING id`,
          [scheduleId, userId, seat],
        );
        reservationIds.push(res[0].id);
      }

      await queryRunner.commitTransaction();

      // Inwalidacja cache rozkładu jazdy
      this.publicInfoService.clearTimetableCache();

      // Asynchroniczne powiadomienie e-mail dla gościa (mock)
      this.sendGuestReservationEmailMock(email, clientNumber, reservationIds, seatNumbers, route_name, departureDate);

      return {
        message: 'Rezerwacja gościa została pomyślnie potwierdzona.',
        clientNumber,
        email,
        seatNumbers,
        routeName: route_name,
        departureTime: departureDate.toISOString(),
        reservationIds,
        // Przekazane tylko dla nowo utworzonych kont gościnnych.
        // Frontend powinien wyświetlić te dane użytkownikowi jednokrotnie.
        ...(guestPassword !== null && {
          guestAccount: {
            note: 'Zostało dla Ciebie utworzone konto. Zaloguj się podanymi danymi aby zarządzać rezerwacją.',
            password: guestPassword,
          },
        }),
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private sendGuestReservationEmailMock(
    email: string,
    clientNumber: string,
    reservationIds: string[],
    seatNumbers: number[],
    routeName: string,
    departureTime: Date
  ) {
    console.log(`[SMTP GUEST MOCK] Wysłano bilet na maila gościa: ${email} (Numer Klienta: ${clientNumber})
    Trasa: ${routeName}
    Odjazd: ${departureTime.toLocaleString('pl-PL')}
    Miejsce(a): ${seatNumbers.join(', ')}
    Rezerwacje: [${reservationIds.join(', ')}]`);
  }

  async bookSeatsOnBehalf(clientId: string, dto: BookSeatsDto) {
    const { scheduleId, seatNumbers } = dto;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Sprawdzenie statusu klienta (zawieszenia / blokady / no-shows)
      const userRes = await queryRunner.manager.query(
        `SELECT status, suspended_until, no_shows FROM users WHERE id = $1`,
        [clientId],
      );
      if (userRes.length === 0) {
        throw new BadRequestException('Użytkownik nie istnieje.');
      }
      
      const user = userRes[0];
      if (user.status === 'blocked') {
        throw new ForbiddenException('Konto klienta jest trwale zablokowane.');
      }

      if (user.no_shows >= 3) {
        throw new ForbiddenException('Konto klienta zablokowane z powodu 3 niezrealizowanych rezerwacji (no-show).');
      }

      if (user.suspended_until && new Date(user.suspended_until) > new Date()) {
        throw new ForbiddenException(
          `Klient ma zablokowaną możliwość rezerwacji ze względu na kary do ${new Date(user.suspended_until).toLocaleString('pl-PL')}.`,
        );
      }

      // 2. Sprawdzenie szczegółów kursu i ceny oraz aktywności trasy
      const scheduleRes = await queryRunner.manager.query(
        `SELECT s.departure_time, b.capacity, s.price_base, r.is_active
         FROM schedules s
         JOIN buses b ON s.bus_id = b.id
         JOIN routes r ON s.route_id = r.id
         WHERE s.id = $1 FOR UPDATE`,
        [scheduleId],
      );

      if (scheduleRes.length === 0) {
        throw new BadRequestException('Wybrany kurs nie istnieje.');
      }

      if (!scheduleRes[0].is_active) {
        throw new BadRequestException('Nie można rezerwować miejsc na nieaktywnej trasie.');
      }

      const { departure_time, capacity, price_base } = scheduleRes[0];
      const departureDate = new Date(departure_time);
      const now = new Date();

      // Walidacja temporalna: Rezerwacja możliwa najpóźniej na 2h przed odjazdem
      const hoursUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (hoursUntilDeparture < 2) {
        throw new BadRequestException('Rezerwacja jest możliwa najpóźniej na 2 godziny przed odjazdem.');
      }

      // Walidacja temporalna: Rezerwacja możliwa maksymalnie 7 dni przed odjazdem
      const daysUntilDeparture = (departureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysUntilDeparture > 7) {
        throw new BadRequestException('Nie można rezerwować miejsc z wyprzedzeniem większym niż 7 dni.');
      }

      // 3. Walidacja pojemności i poprawności numerów siedzeń
      for (const seat of seatNumbers) {
        if (seat < 1 || seat > capacity) {
          throw new BadRequestException(`Miejsce ${seat} wykracza poza pojemność pojazdu (1-${capacity}).`);
        }
      }

      // 4. Sprawdzenie czy wybrane miejsca są już zajęte
      const occupiedSeatsRes = await queryRunner.manager.query(
        `SELECT seat_number FROM reservations 
         WHERE schedule_id = $1 AND status != 'Anulowana' AND seat_number = ANY($2::int[])`,
         [scheduleId, seatNumbers],
      );

      if (occupiedSeatsRes.length > 0) {
        const occupiedList = occupiedSeatsRes.map((r: any) => r.seat_number).join(', ');
        throw new ConflictException(`Wybrane miejsca (${occupiedList}) są już zajęte.`);
      }

      const priceBaseVal = parseFloat(price_base || '0');
      const reservationIds: string[] = [];

      // 5. Zapis rezerwacji jako 'Opłacona' oraz utworzenie powiązanych płatności (natychmiastowych)
      for (const seat of seatNumbers) {
        const res = await queryRunner.manager.query(
          `INSERT INTO reservations (schedule_id, user_id, seat_number, status) 
           VALUES ($1, $2, $3, 'Opłacona') RETURNING id`,
          [scheduleId, clientId, seat],
        );
        const reservationId = res[0].id;
        reservationIds.push(reservationId);

        // Zapis natychmiastowej płatności w bazie danych
        await queryRunner.manager.query(
          `INSERT INTO payments (reservation_id, amount, status, payment_method)
           VALUES ($1, $2, 'Zakończona', 'Gotówka/Karta (Sekretariat)')`,
          [reservationId, priceBaseVal],
        );
      }

      await queryRunner.commitTransaction();

      // Inwalidacja cache rozkładu jazdy
      this.publicInfoService.clearTimetableCache();

      // Asynchroniczne powiadomienie e-mail (mock)
      this.sendReservationEmailMock(clientId, reservationIds);

      return {
        message: 'Rezerwacja (opłacona natychmiastowo) została pomyślnie potwierdzona przez Sekretariat.',
        reservationIds,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
