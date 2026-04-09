# KKBus - Zintegrowany System Zarządzania Firmą Transportową

![Licencja](https://img.shields.io/badge/licencja-MIT-green)
![Technologie](https://img.shields.io/badge/stack-NestJS%20%7C%20PostgreSQL%20%7C%20Docker-orange)

## 🚌 O Projekcie
[cite_start]KKBus to nowoczesna, responsywna aplikacja internetowa zaprojektowana dla firmy transportowej **KKBus sp. z o.o.**, obsługującej przewozy pasażerskie na trasie Kraków-Katowice[cite: 15, 16]. [cite_start]System automatyzuje kluczowe procesy biznesowe: od rezerwacji biletów przez klientów, po zaawansowane zarządzanie flotą, grafikami kierowców i analityką finansową[cite: 20, 21].

## 👥 Zespół Projektowy
* [cite_start]**Nikita Parkovskyi** – Lider zespołu, Backend Developer & DBA [cite: 666, 937]
* [cite_start]**Artur Orfin** – Frontend Developer, UI/UX Designer & QA [cite: 666, 942]

## 🛠 Stos Technologiczny
* [cite_start]**Backend:** Node.js (Framework NestJS) + TypeScript [cite: 850, 853]
* [cite_start]**Frontend:** HTML5, CSS3 (Mobile-First), JavaScript [cite: 823, 843]
* [cite_start]**Baza Danych:** PostgreSQL (Relacyjna baza KKBusDB) [cite: 872, 873]
* [cite_start]**Infrastruktura:** Docker & Docker Compose (Konteneryzacja) [cite: 905, 906]

## 🚀 Kluczowe Funkcjonalności
* [cite_start]**System Rezerwacji:** Zabezpieczony przed overbookingiem dzięki blokowaniu wierszy na poziomie bazy danych[cite: 882, 886].
* [cite_start]**Program Lojalnościowy:** Automatyczne naliczanie punktów ($1\ km = 1\ punkt$) z możliwością wymiany na nagrody[cite: 51, 757].
* [cite_start]**Panele Pracownicze:** Dedykowane interfejsy dla kierowców (grafiki, listy pasażerów) oraz sekretariatu[cite: 21, 25].
* [cite_start]**Bezpieczeństwo:** Szyfrowanie haseł (bcrypt), protokół HTTPS oraz blokada konta po 3 nieudanych próbach logowania[cite: 46, 754].

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
