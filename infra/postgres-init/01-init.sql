CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabele słownikowe
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('Klient'), ('Kierowca'), ('Sekretariat'), ('Właściciel');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    failed_login_attempts INT DEFAULT 0,
    no_shows INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
    suspended_until TIMESTAMP DEFAULT NULL,
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
    label VARCHAR(150) DEFAULT 'Korytarz Autobusowy',
    description TEXT DEFAULT 'Nowa trasa w systemie',
    color VARCHAR(20) DEFAULT '#0EA5E9',
    total_distance_km INT NOT NULL CHECK (total_distance_km > 0),
    stops JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE
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
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    points_balance INT DEFAULT 0 CHECK (points_balance >= 0),
    last_transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dyspozycyjność Kierowców
CREATE TABLE driver_availability (
    id SERIAL PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    available_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Dostępny' CHECK (status IN ('Dostępny', 'Niedostępny', 'Urlop', 'Zwolnienie')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (driver_id, available_date)
);

-- Raporty z Kursów (Wypełniane przez kierowców po zakończeniu trasy)
CREATE TABLE route_reports (
    id SERIAL PRIMARY KEY,
    schedule_id INT NOT NULL UNIQUE REFERENCES schedules(id) ON DELETE RESTRICT,
    actual_passengers INT NOT NULL CHECK (actual_passengers >= 0),
    fuel_liters DECIMAL(10,2) NOT NULL CHECK (fuel_liters >= 0),
    fuel_cost DECIMAL(10,2) NOT NULL CHECK (fuel_cost >= 0),
    distance_km INT NOT NULL CHECK (distance_km >= 0),
    average_fuel_consumption DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Oczekujący' CHECK (status IN ('Oczekujący', 'Zatwierdzony', 'Odrzucony')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profile Klientów (rozszerzenie tabeli users)
CREATE TABLE client_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    client_number VARCHAR(50) UNIQUE NOT NULL,
    loyalty_opt_in BOOLEAN DEFAULT FALSE,
    activation_token VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inspekcje pojazdów (Check-in / Check-out)
CREATE TABLE vehicle_inspections (
    id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES schedules(id) ON DELETE SET NULL,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bus_id INT NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PRE_TRIP', 'POST_TRIP')),
    mileage INT NOT NULL CHECK (mileage >= 0),
    fuel_level INT NOT NULL CHECK (fuel_level >= 0 AND fuel_level <= 100),
    lights_ok BOOLEAN DEFAULT TRUE,
    tires_ok BOOLEAN DEFAULT TRUE,
    interior_ok BOOLEAN DEFAULT TRUE,
    fluids_ok BOOLEAN DEFAULT TRUE,
    emergency_equipment_ok BOOLEAN DEFAULT TRUE,
    keys_returned BOOLEAN DEFAULT NULL, -- Używane tylko dla POST_TRIP
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usterki zgłaszane przez kierowców
CREATE TABLE vehicle_defects (
    id SERIAL PRIMARY KEY,
    bus_id INT NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id INT REFERENCES schedules(id) ON DELETE SET NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('NISKA', 'ŚREDNIA', 'KRYTYCZNA')),
    description TEXT NOT NULL,
    photo_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'OTWARTA' CHECK (status IN ('OTWARTA', 'W_NAPRAWIE', 'ZAMKNIĘTA')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sygnały SOS (Zdarzenia awaryjne)
CREATE TABLE sos_alerts (
    id SERIAL PRIMARY KEY,
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id INT REFERENCES schedules(id) ON DELETE SET NULL,
    bus_id INT NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cyfrowa teczka pojazdu (Dokumenty)
CREATE TABLE vehicle_documents (
    id SERIAL PRIMARY KEY,
    bus_id INT NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('OC', 'AC', 'PRZEGLĄD_TECHNICZNY')),
    expiry_date DATE NOT NULL,
    document_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Próby nieudanych logowań (sliding window brute force protection)
CREATE TABLE failed_logins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_failed_logins_email_time ON failed_logins(email, attempted_at);

-- Nagrody Lojalnościowe
CREATE TABLE loyalty_rewards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    required_points INT NOT NULL CHECK (required_points > 0),
    is_active BOOLEAN DEFAULT TRUE
);

-- Logi transakcji punktów lojalnościowych
CREATE TABLE loyalty_transactions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_delta INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


