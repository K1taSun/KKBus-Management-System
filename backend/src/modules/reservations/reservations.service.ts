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
    const { scheduleId, seats, useLoyaltyPoints } = dto;
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
      for (const seatObj of seats) {
        if (seatObj.seatNumber < 1 || seatObj.seatNumber > capacity) {
          throw new BadRequestException(`Miejsce ${seatObj.seatNumber} wykracza poza pojemność pojazdu (1-${capacity}).`);
        }
      }

      const seatNumbers = seats.map(s => s.seatNumber);

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

      // 5. Pobranie aktualnej polityki cenowej
      const policyRes = await queryRunner.manager.query(
        `SELECT student_discount_percent, child_discount_percent, loyalty_point_value FROM pricing_policies WHERE is_current = TRUE LIMIT 1`
      );
      const policy = policyRes[0] || { student_discount_percent: 51, child_discount_percent: 30, loyalty_point_value: 0.10 };

      // 6. Wyliczenie całkowitej kwoty
      let totalAmount = 0;
      const basePrice = parseFloat(scheduleRes[0].price_base || '0');
      
      const seatsWithPrice = seats.map(seatObj => {
        let finalPrice = basePrice;
        if (seatObj.discountType === 'STUDENT') {
          finalPrice = basePrice * (1 - policy.student_discount_percent / 100);
        } else if (seatObj.discountType === 'CHILD') {
          finalPrice = basePrice * (1 - policy.child_discount_percent / 100);
        }
        totalAmount += finalPrice;
        return { ...seatObj, finalPrice };
      });

      // 7. Obsługa punktów lojalnościowych
      let pointsUsed = 0;
      let discountFromPoints = 0;
      
      if (useLoyaltyPoints) {
        const loyaltyRes = await queryRunner.manager.query(
          `SELECT points_balance FROM loyalty_points WHERE user_id = $1 FOR UPDATE`,
          [userId]
        );
        if (loyaltyRes.length > 0) {
          const balance = loyaltyRes[0].points_balance;
          const maxPointsDiscount = balance * parseFloat(policy.loyalty_point_value);
          
          if (maxPointsDiscount >= totalAmount) {
            // Pokrywa całą kwotę (lub resztę)
            pointsUsed = Math.ceil(totalAmount / parseFloat(policy.loyalty_point_value));
            discountFromPoints = totalAmount;
          } else {
            // Wykorzystuje wszystkie punkty
            pointsUsed = balance;
            discountFromPoints = maxPointsDiscount;
          }

          if (pointsUsed > 0) {
            await queryRunner.manager.query(
              `UPDATE loyalty_points SET points_balance = points_balance - $1, last_transaction_date = CURRENT_TIMESTAMP WHERE user_id = $2`,
              [pointsUsed, userId]
            );
            await queryRunner.manager.query(
              `INSERT INTO loyalty_transactions (user_id, points_delta, description) VALUES ($1, $2, $3)`,
              [userId, -pointsUsed, `Wykorzystano przy rezerwacji kursu #${scheduleId}`]
            );
          }
        }
      }

      // Proporcjonalne rozłożenie zniżki punktowej na miejsca (uproszczone: równo lub odejmowane z całości, my zapisujemy po prostu final_price pomniejszony)
      const discountPerSeat = seatsWithPrice.length > 0 ? (discountFromPoints / seatsWithPrice.length) : 0;

      // 8. Zapis rezerwacji w bazie danych i płatności
      const reservationIds: string[] = [];
      for (const seatObj of seatsWithPrice) {
        const adjustedPrice = Math.max(0, seatObj.finalPrice - discountPerSeat);
        const res = await queryRunner.manager.query(
          `INSERT INTO reservations (schedule_id, user_id, seat_number, status, discount_type, final_price) 
           VALUES ($1, $2, $3, 'Potwierdzona', $4, $5) RETURNING id`,
          [scheduleId, userId, seatObj.seatNumber, seatObj.discountType, adjustedPrice]
        );
        reservationIds.push(res[0].id);

        const paymentStatus = dto.paymentMethod === 'ON_BOARD' ? 'Oczekująca' : 'Zakończona';
        await queryRunner.manager.query(
          `INSERT INTO payments (reservation_id, amount, status, payment_method)
           VALUES ($1, $2, $3, $4)`,
          [res[0].id, adjustedPrice, paymentStatus, dto.paymentMethod]
        );
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
    const { scheduleId, seats, email, first_name, last_name, phone } = dto;
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
      for (const seatObj of seats) {
        if (seatObj.seatNumber < 1 || seatObj.seatNumber > capacity) {
          throw new BadRequestException(`Miejsce ${seatObj.seatNumber} wykracza poza pojemność pojazdu (1-${capacity}).`);
        }
      }

      const seatNumbers = seats.map(s => s.seatNumber);

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

      // 5. Pobranie polityki cenowej
      const policyRes = await queryRunner.manager.query(
        `SELECT student_discount_percent, child_discount_percent FROM pricing_policies WHERE is_current = TRUE LIMIT 1`
      );
      const policy = policyRes[0] || { student_discount_percent: 51, child_discount_percent: 30 };
      const basePrice = parseFloat(scheduleRes[0].price_base || '0');

      // 6. Zapis rezerwacji
      const reservationIds: string[] = [];
      for (const seatObj of seats) {
        let finalPrice = basePrice;
        if (seatObj.discountType === 'STUDENT') {
          finalPrice = basePrice * (1 - policy.student_discount_percent / 100);
        } else if (seatObj.discountType === 'CHILD') {
          finalPrice = basePrice * (1 - policy.child_discount_percent / 100);
        }

        const res = await queryRunner.manager.query(
          `INSERT INTO reservations (schedule_id, user_id, seat_number, status, discount_type, final_price) 
           VALUES ($1, $2, $3, 'Potwierdzona', $4, $5) RETURNING id`,
          [scheduleId, userId, seatObj.seatNumber, seatObj.discountType, finalPrice],
        );
        reservationIds.push(res[0].id);

        const paymentStatus = dto.paymentMethod === 'ON_BOARD' ? 'Oczekująca' : 'Zakończona';
        await queryRunner.manager.query(
          `INSERT INTO payments (reservation_id, amount, status, payment_method)
           VALUES ($1, $2, $3, $4)`,
          [res[0].id, finalPrice, paymentStatus, dto.paymentMethod]
        );
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
    const { scheduleId, seats } = dto;
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
      for (const seatObj of seats) {
        if (seatObj.seatNumber < 1 || seatObj.seatNumber > capacity) {
          throw new BadRequestException(`Miejsce ${seatObj.seatNumber} wykracza poza pojemność pojazdu (1-${capacity}).`);
        }
      }

      const seatNumbers = seats.map(s => s.seatNumber);

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
      // W Sekretariacie zwykle rezerwacja OnBehalf to brak zniżki lub ręcznie przypisana zniżka, my po prostu wpisujemy NORMAL i cenę bazową (albo używamy discount z dto)
      for (const seatObj of seats) {
        let finalPrice = priceBaseVal;
        if (seatObj.discountType === 'STUDENT') {
          finalPrice = priceBaseVal * (1 - 51 / 100);
        } else if (seatObj.discountType === 'CHILD') {
          finalPrice = priceBaseVal * (1 - 30 / 100);
        }

        const res = await queryRunner.manager.query(
          `INSERT INTO reservations (schedule_id, user_id, seat_number, status, discount_type, final_price) 
           VALUES ($1, $2, $3, 'Opłacona', $4, $5) RETURNING id`,
          [scheduleId, clientId, seatObj.seatNumber, seatObj.discountType, finalPrice],
        );
        const reservationId = res[0].id;
        reservationIds.push(reservationId);

        // Zapis natychmiastowej płatności w bazie danych
        await queryRunner.manager.query(
          `INSERT INTO payments (reservation_id, amount, status, payment_method)
           VALUES ($1, $2, 'Zakończona', 'Gotówka/Karta (Sekretariat)')`,
          [reservationId, finalPrice],
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
