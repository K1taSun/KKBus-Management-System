CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabele słownikowe
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('Klient'), ('Kierowca'), ('Sekretariat'), ('Właściciel');

-- Główna tabela userów
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    failed_login_attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flota (autobusy)
CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    status VARCHAR(50) DEFAULT 'Aktywny' CHECK (status IN ('Aktywny', 'W serwisie', 'Złom'))
);

-- Trasy
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    total_distance_km INT NOT NULL CHECK (total_distance_km > 0)
);

-- Rozkład (Kursy)
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    route_id INT NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bus_id INT NOT NULL REFERENCES buses(id) ON DELETE RESTRICT,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    price_base DECIMAL(10,2) NOT NULL CHECK (price_base >= 0),
    CHECK (arrival_time > departure_time)
);

-- Rezerwacje
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id INT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_number INT NOT NULL CHECK (seat_number > 0),
    status VARCHAR(50) DEFAULT 'Potwierdzona' CHECK (status IN ('Potwierdzona', 'Opłacona', 'Anulowana')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Gwarancja, że na 1 kurs = 1 konkretne miejsce
    UNIQUE (schedule_id, seat_number)
);

-- Punkty Lojalnościowe
CREATE TABLE loyalty_points (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_balance INT DEFAULT 0 CHECK (points_balance >= 0),
    last_transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jak odpali to chłodzimy szampana
