# Projekt Bazy Danych - System KKBus (KKBusDB)

<!-- Baza danych to serce systemu, więc musi być git -->

## 1. Schemat Encji (ERD)

Będziemy używać PostgreSQL. Każda tabela ma `id` (Serial/UUID), `created_at` i `updated_at`.

### 1.1. Tabele Podstawowe

#### `users` (Użytkownicy)
*   `id`: UUID (Primary Key)
*   `email`: String (Unique) - Login użytkownika
*   `password_hash`: String - Szyfrowane hasełko (bcrypt)
*   `first_name`, `last_name`: String
*   `phone`: String
*   `role_id`: Int (Foreign Key to `roles`)
*   `failed_login_attempts`: Int (domyślnie 0, blokada po 3)

#### `roles` (Role)
*   `id`: Serial (PK)
*   `name`: String (Klient, Kierowca, Sekretariat, Właściciel)

#### `buses` (Flota)
*   `id`: Serial (PK)
*   `registration_number`: String (Unique)
*   `model`: String
*   `capacity`: Int - Liczba miejsc siedzących
*   `status`: String (Aktywny, W serwisie, Złom)

### 1.2. Logika Kursów

#### `routes` (Trasy)
*   `id`: Serial (PK)
*   `name`: String (np. "Kraków - Katowice")
*   `total_distance_km`: Int

#### `schedules` (Kursy/Rozkład)
*   `id`: Serial (PK)
*   `route_id`: Int (FK to `routes`)
*   `bus_id`: Int (FK to `buses`)
*   `driver_id`: UUID (FK to `users`)
*   `departure_time`: Timestamp
*   `arrival_time`: Timestamp
*   `price_base`: Decimal

### 1.3. Rezerwacje i Lojalność

#### `reservations` (Rezerwacje)
*   `id`: UUID (PK)
*   `schedule_id`: Int (FK to `schedules`)
*   `user_id`: UUID (FK to `users`)
*   `seat_number`: Int
*   `status`: String (Potwierdzona, Opłacona, Anulowana)
*   <!-- Tu musimy pilnować overbookingu na poziomie bazy (SELECT ... FOR UPDATE) -->

#### `loyalty_points` (Punkty)
*   `id`: Serial (PK)
*   `user_id`: UUID (FK to `users`)
*   `points_balance`: Int
*   `last_transaction_date`: Timestamp

## 2. Relacje
*   `users` 1:N `reservations` (Użytkownik może mieć wiele biletów)
*   `schedules` 1:N `reservations` (Na jeden kurs jest wiele rezerwacji)
*   `buses` 1:N `schedules` (Bus jeździ na wielu kursach)
*   `routes` 1:N `schedules` (Trasa ma wiele godzin odjazdów)

## 3. Normalizacja
Wszystko w 3NF (Trzecia Forma Normalna). Nie redundujemy danych, np. dystans trasy jest tylko w `routes`, nie w każdym `schedule`.

---
*Prowizorka najtrwalej trzyma, ale baza musi stać na twardych relacjach.*
