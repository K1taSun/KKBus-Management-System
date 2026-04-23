# KKBus - Zintegrowany System Zarządzania Firmą Transportową

![Licencja](https://img.shields.io/badge/licencja-MIT-green)
![Technologie](https://img.shields.io/badge/stack-NestJS%20%7C%20PostgreSQL%20%7C%20Docker-orange)

## 🚌 O Projekcie
KKBus to nowoczesna, responsywna aplikacja internetowa zaprojektowana dla firmy transportowej **KKBus sp. z o.o.**, obsługującej przewozy pasażerskie na trasie Kraków-Katowice. System automatyzuje kluczowe procesy biznesowe: od rezerwacji biletów przez klientów, po zaawansowane zarządzanie flotą, grafikami kierowców i analityką finansową.

## 👥 Zespół Projektowy
* **Nikita Parkovskyi** – Lider zespołu, Backend Developer & DBA
* **Artur Orfin** – Frontend Developer, UI/UX Designer & QA

## 🛠 Stos Technologiczny
* **Backend:** Node.js (Framework NestJS) + TypeScript
* **Frontend:** HTML5, CSS3 (Mobile-First), JavaScript
* **Baza Danych:** PostgreSQL (Relacyjna baza KKBusDB)
* **Infrastruktura:** Docker & Docker Compose (Konteneryzacja)

## 🚀 Kluczowe Funkcjonalności
* **System Rezerwacji:** Zabezpieczony przed overbookingiem dzięki blokowaniu wierszy na poziomie bazy danych.
* **Program Lojalnościowy:** Automatyczne naliczanie punktów ($1\ km = 1\ punkt$) z możliwością wymiany na nagrody.
* **Panele Pracownicze:** Dedykowane interfejsy dla kierowców (grafiki, listy pasażerów) oraz sekretariatu.
* **Bezpieczeństwo:** Szyfrowanie haseł (bcrypt), protokół HTTPS oraz blokada konta po 3 nieudanych próbach logowania.

## 📂 Architektura Projektu
```text
KKBus-Management-System/
├── backend/                # Logika serwerowa (NestJS & TypeScript)
│   ├── src/
│   │   ├── modules/        # Moduły: Auth, Reservations, Fleet, Loyalty, Reports
│   │   └── database/       # Konfiguracja PostgreSQL i migracje
├── frontend/               # Warstwa prezentacji (Responsive UI - Mobile First)
│   ├── src/
│   │   ├── css/            # Style CSS Flexbox/Grid
│   │   └── views/          # Widoki: Klient, Kierowca, Administrator
├── infra/                  # Infrastruktura i konteneryzacja
│   ├── docker-compose.yml  # Orkiestracja kontenerów
│   └── postgres-init/      # Skrypty inicjalizacyjne SQL
├── docs/                   # Dokumentacja projektowa (ERD, Specyfikacja)
└── LICENSE                 # Licencja MIT

