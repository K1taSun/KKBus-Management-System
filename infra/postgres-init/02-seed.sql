-- =============================================================
-- KKBusDB – Dane testowe (seed)
-- Zadanie 2.1: Implementacja bazy danych
-- Autor: Nikita Parkovskyi
-- =============================================================

-- Autobusy (flota KKBus)
INSERT INTO buses (registration_number, model, capacity, status) VALUES
  ('KR 12345', 'Solaris Urbino 12',   50, 'Aktywny'),
  ('KR 54321', 'Mercedes Tourismo',   55, 'Aktywny'),
  ('KR 99999', 'MAN Lion''s Coach',   48, 'W serwisie');

-- Trasy
INSERT INTO routes (name, total_distance_km) VALUES
  ('Kraków – Katowice',  79),
  ('Katowice – Kraków',  79),
  ('Kraków – Katowice (Ekspres)', 74);

-- Użytkownicy testowi (hasła = bcrypt("Test1234!") dla wszystkich)
-- UWAGA: W środowisku produkcyjnym używać wyłącznie zahashowanych haseł generowanych aplikacyjnie.
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role_id) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'klient@kkbus.pl',
   '$2b$10$KIXy4.8/.7V1rE1bB3PElO1e8YWfnV4S4yq3XhCJCR21k.JHsGhpa',
   'Jan', 'Kowalski', '600100200', 1),

  ('a0000000-0000-0000-0000-000000000002',
   'kierowca@kkbus.pl',
   '$2b$10$KIXy4.8/.7V1rE1bB3PElO1e8YWfnV4S4yq3XhCJCR21k.JHsGhpa',
   'Marek', 'Nowak', '700300400', 2),

  ('a0000000-0000-0000-0000-000000000003',
   'sekretariat@kkbus.pl',
   '$2b$10$KIXy4.8/.7V1rE1bB3PElO1e8YWfnV4S4yq3XhCJCR21k.JHsGhpa',
   'Anna', 'Wiśniewska', '500600700', 3),

  ('a0000000-0000-0000-0000-000000000004',
   'wlasciciel@kkbus.pl',
   '$2b$10$KIXy4.8/.7V1rE1bB3PElO1e8YWfnV4S4yq3XhCJCR21k.JHsGhpa',
   'Krzysztof', 'Zieliński', '600900800', 4);

-- Portfele lojalnościowe dla klientów
INSERT INTO loyalty_points (user_id, points_balance) VALUES
  ('a0000000-0000-0000-0000-000000000001', 158);

-- Kursy (rozkład jazdy) – dzień dzisiejszy i jutro
INSERT INTO schedules (route_id, bus_id, driver_id, departure_time, arrival_time, price_base) VALUES
  (1, 1, 'a0000000-0000-0000-0000-000000000002',
   NOW()::date + '08:00:00'::interval,
   NOW()::date + '09:15:00'::interval,
   25.00),

  (1, 2, 'a0000000-0000-0000-0000-000000000002',
   NOW()::date + '10:30:00'::interval,
   NOW()::date + '11:45:00'::interval,
   25.00),

  (2, 1, 'a0000000-0000-0000-0000-000000000002',
   NOW()::date + '14:00:00'::interval,
   NOW()::date + '15:15:00'::interval,
   25.00),

  (3, 2, 'a0000000-0000-0000-0000-000000000002',
   NOW()::date + '16:00:00'::interval,
   NOW()::date + '17:05:00'::interval,
   35.00),

  -- Jutro
  (1, 1, 'a0000000-0000-0000-0000-000000000002',
   (NOW()::date + 1) + '08:00:00'::interval,
   (NOW()::date + 1) + '09:15:00'::interval,
   25.00),

  (2, 2, 'a0000000-0000-0000-0000-000000000002',
   (NOW()::date + 1) + '12:00:00'::interval,
   (NOW()::date + 1) + '13:15:00'::interval,
   25.00);

-- Przykładowa rezerwacja dla klienta testowego
INSERT INTO reservations (schedule_id, user_id, seat_number, status) VALUES
  (1, 'a0000000-0000-0000-0000-000000000001', 12, 'Potwierdzona');
