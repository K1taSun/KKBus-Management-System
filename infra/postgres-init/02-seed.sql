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
INSERT INTO routes (name, total_distance_km, stops) VALUES
  ('Kraków – Katowice (Zwykła)',  79, '["Kraków MDA", "Rondo Ofiar Katynia", "Chrzanów", "Jaworzno", "Katowice Sądowa"]'),
  ('Katowice – Kraków (Zwykła)',  79, '["Katowice Sądowa", "Jaworzno", "Chrzanów", "Rondo Ofiar Katynia", "Kraków MDA"]'),
  ('Kraków – Katowice (Ekspres)', 74, '["Kraków MDA", "Katowice Sądowa"]'),
  ('Katowice – Kraków (Ekspres)', 74, '["Katowice Sądowa", "Kraków MDA"]');

-- Użytkownicy testowi (hasła = bcrypt("Test1234!") dla wszystkich)
-- UWAGA: W środowisku produkcyjnym używać wyłącznie zahashowanych haseł generowanych aplikacyjnie.
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role_id) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'klient@kkbus.pl',
   '$2b$10$7yqCCa50yoa5eQy1IRa8xOsXo1Ta6CsHQs3ceMjmPMQW9B3Qgq87C',
   'Jan', 'Kowalski', '600100200', 1),

  ('a0000000-0000-0000-0000-000000000002',
   'kierowca@kkbus.pl',
   '$2b$10$7yqCCa50yoa5eQy1IRa8xOsXo1Ta6CsHQs3ceMjmPMQW9B3Qgq87C',
   'Marek', 'Nowak', '700300400', 2),

  ('a0000000-0000-0000-0000-000000000003',
   'sekretariat@kkbus.pl',
   '$2b$10$7yqCCa50yoa5eQy1IRa8xOsXo1Ta6CsHQs3ceMjmPMQW9B3Qgq87C',
   'Anna', 'Wiśniewska', '500600700', 3),

  ('a0000000-0000-0000-0000-000000000004',
   'wlasciciel@kkbus.pl',
   '$2b$10$7yqCCa50yoa5eQy1IRa8xOsXo1Ta6CsHQs3ceMjmPMQW9B3Qgq87C',
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

  (3, 2, 'a0000000-0000-0000-0000-000000000002',
   NOW()::date + '10:30:00'::interval,
   NOW()::date + '11:45:00'::interval,
   35.00),

  (2, 1, 'a0000000-0000-0000-0000-000000000002',
   NOW()::date + '14:00:00'::interval,
   NOW()::date + '15:15:00'::interval,
   25.00),

  (4, 2, 'a0000000-0000-0000-0000-000000000002',
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

-- Profil klienta dla Jana Kowalskiego
INSERT INTO client_profiles (user_id, date_of_birth, client_number, loyalty_opt_in) VALUES
  ('a0000000-0000-0000-0000-000000000001', '1995-04-12', 'KKB-2026-000001', TRUE);

-- Katalog nagród lojalnościowych
INSERT INTO loyalty_rewards (name, required_points, is_active) VALUES
  ('Darmowy Bilet Kraków-Katowice (Jednorazowy)', 200, TRUE),
  ('Voucher rabatowy -50% na kolejny przejazd', 100, TRUE),
  ('Voucher rabatowy -20% na kolejny przejazd', 50, TRUE);

