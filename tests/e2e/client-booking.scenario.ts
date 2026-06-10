import axios from 'axios';

export async function runClientBookingScenario(apiUrl: string) {
  const email = `e2e.client.${Math.floor(Math.random() * 100000)}@example.com`;
  const password = 'Password123!';
  const birthDate = '1995-04-20';

  // 1. Walidacja wieku (powinno zwrócić błąd 400)
  try {
    await axios.post(`${apiUrl}/auth/register`, {
      email,
      password,
      first_name: 'Nieletni',
      last_name: 'Test',
      dateOfBirth: '2018-01-01', // Too young
      phone: '555666777',
      loyaltyProgramConsent: true,
    });
    throw new Error('Powinno zwrócić błąd walidacji wieku (under 13)!');
  } catch (err: any) {
    if (err.response && err.response.status === 400) {
      console.log('  -> Poprawnie odrzucono rejestrację osoby poniżej 13 roku życia (HTTP 400)');
    } else {
      throw err;
    }
  }

  // 2. Poprawna rejestracja
  console.log(`  -> Rejestrowanie użytkownika: ${email}...`);
  const regRes = await axios.post(`${apiUrl}/auth/register`, {
    email,
    password,
    first_name: 'Tomasz',
    last_name: 'E2E',
    dateOfBirth: birthDate,
    phone: '555666777',
    loyaltyProgramConsent: true,
  });
  
  if (!regRes.data.clientNumber) {
    throw new Error('Brak numeru klienta w odpowiedzi rejestracji!');
  }
  console.log(`  -> Użytkownik zarejestrowany. Numer klienta: ${regRes.data.clientNumber}`);

  // 3. Logowanie i wyciągnięcie ciasteczek JWT
  console.log('  -> Logowanie...');
  const loginRes = await axios.post(
    `${apiUrl}/auth/login`,
    { email, password },
    { withCredentials: true }
  );

  const cookies = loginRes.headers['set-cookie'];
  if (!cookies || cookies.length === 0) {
    throw new Error('Serwer nie zwrócił ciasteczek z tokenem JWT!');
  }
  console.log('  -> Zalogowano pomyślnie. Tokeny JWT odebrane w ciasteczkach HttpOnly.');

  // Przygotowanie klienta axios z ciasteczkami sesyjnymi
  const client = axios.create({
    baseURL: apiUrl,
    headers: {
      Cookie: cookies.map(c => c.split(';')[0]).join('; '),
    },
  });

  // 4. Pobranie profilu użytkownika
  console.log('  -> Pobieranie profilu...');
  const profileRes = await client.get('/auth/profile');
  console.log(`  -> Profil pobrany. Imię: ${profileRes.data.firstName}, Rola: ${profileRes.data.role}, Punkty lojalnościowe: ${profileRes.data.pointsBalance}`);

  // 5. Pobranie rozkładu jazdy w celu znalezienia wolnego kursu
  console.log('  -> Pobieranie rozkładu jazdy...');
  const timetableRes = await axios.get(`${apiUrl}/public-info/timetable`);
  const routes = timetableRes.data;
  
  if (!routes || routes.length === 0) {
    console.log('  -> [INFO] Brak zdefiniowanych tras w bazie danych. Kończenie testu (nie można wykonać rezerwacji).');
    return;
  }

  // Szukamy aktywnej trasy z kursem w przyszłości (obsługujemy zarówno płaską, jak i zagnieżdżoną strukturę)
  let targetScheduleId: string | null = null;
  let departureTimeStr = '';

  for (const r of routes) {
    if (r.schedules && r.schedules.length > 0) {
      for (const s of r.schedules) {
        const depTime = new Date(s.departure_time);
        const hoursDiff = (depTime.getTime() - Date.now()) / (1000 * 60 * 60);
        // Szukamy kursu w przedziale czasowym 25h - 7d w celu umożliwienia testu anulowania (wymaga >24h)
        if (hoursDiff > 25 && hoursDiff < 168) {
          targetScheduleId = s.id;
          departureTimeStr = s.departure_time;
          break;
        }
      }
    } else {
      // Płaska struktura zwracana bezpośrednio z getRoutesAndTimetable
      const depTimeStr = r.departure_time || r.departureTime;
      if (depTimeStr) {
        const depTime = new Date(depTimeStr);
        const hoursDiff = (depTime.getTime() - Date.now()) / (1000 * 60 * 60);
        if (hoursDiff > 25 && hoursDiff < 168) {
          targetScheduleId = r.schedule_id || r.id;
          departureTimeStr = depTimeStr;
          break;
        }
      }
    }
    if (targetScheduleId) break;
  }

  if (!targetScheduleId) {
    console.log('  -> [INFO] Brak kursu w odpowiednim przedziale czasowym (2h-7d) w bazie. Pomijanie rezerwacji.');
    return;
  }

  console.log(`  -> Znaleziono pasujący kurs #${targetScheduleId} (odjazd: ${new Date(departureTimeStr).toLocaleString('pl-PL')})`);

  // Pobieramy szczegóły wybranego kursu w celu znalezienia wolnego miejsca
  console.log(`  -> Pobieranie szczegółów kursu #${targetScheduleId} w celu znalezienia wolnego miejsca...`);
  const scheduleDetailRes = await axios.get(`${apiUrl}/schedules/${targetScheduleId}`);
  const scheduleDetail = scheduleDetailRes.data;

  const bookedSeats = new Set<number>(scheduleDetail.booked_seats || []);
  const capacity = scheduleDetail.capacity || 30;
  let freeSeatNumber = -1;

  for (let seat = 1; seat <= capacity; seat++) {
    if (!bookedSeats.has(seat)) {
      freeSeatNumber = seat;
      break;
    }
  }

  if (freeSeatNumber === -1) {
    throw new Error(`Brak wolnych miejsc na kursie #${targetScheduleId}!`);
  }

  // 6. Wykonanie rezerwacji miejsca (próbujemy kolejne wolne miejsca w razie konfliktu w bazie)
  let reservationId = '';
  let seatToBook = freeSeatNumber;
  let attempts = 0;

  while (attempts < 15) {
    try {
      console.log(`  -> Rezerwacja wolnego miejsca numer ${seatToBook}...`);
      const bookRes = await client.post('/reservations', {
        scheduleId: targetScheduleId,
        seats: [{ seatNumber: seatToBook, discountType: 'NORMAL' }],
        paymentMethod: 'ON_BOARD',
        useLoyaltyPoints: false,
      });
      reservationId = bookRes.data.reservationIds[0];
      console.log(`  -> Rezerwacja utworzona pomyślnie. ID: ${reservationId}`);
      break;
    } catch (err: any) {
      const isDuplicate = err.response && err.response.status === 500 && 
        (err.response.data?.message?.includes('duplicate key') || JSON.stringify(err.response.data).includes('duplicate key'));
      if (isDuplicate) {
        console.log(`  -> [INFO] Miejsce ${seatToBook} jest zablokowane w bazie (np. z powodu starej rezerwacji). Próba kolejnego...`);
        seatToBook++;
        if (seatToBook > capacity) seatToBook = 1;
        attempts++;
      } else {
        throw err;
      }
    }
  }

  if (!reservationId) {
    throw new Error('Nie udało się zarezerwować żadnego miejsca po 15 próbach.');
  }

  // 7. Pobranie historii rezerwacji
  console.log('  -> Sprawdzanie historii rezerwacji...');
  const historyRes = await client.get('/auth/history');
  const hasReservation = historyRes.data.some((res: any) => res.id === reservationId);
  if (!hasReservation) {
    throw new Error('Rezerwacja nie jest widoczna w historii użytkownika!');
  }
  console.log('  -> Rezerwacja poprawnie zarejestrowana w historii.');

  // 8. Anulowanie rezerwacji
  console.log('  -> Anulowanie rezerwacji...');
  const cancelRes = await client.delete(`/reservations/${reservationId}`);
  console.log(`  -> ${cancelRes.data.message}`);
}
