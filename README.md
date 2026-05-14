# KKBus - Zintegrowany System Zarządzania Firmą Transportową

![Licencja](https://img.shields.io/badge/licencja-MIT-green)
![Technologie](https://img.shields.io/badge/stack-NestJS%20%7C%20Next.js%20%7C%20PostgreSQL-blue)
![Docker](https://img.shields.io/badge/docker-ready-cyan)

## 🚌 O Projekcie
KKBus to profesjonalna, nowoczesna platforma transportowa zaprojektowana dla **KKBus sp. z o.o.**, dedykowana obsłudze pasażerów na trasie **Kraków ↔ Katowice**. System łączy w sobie nowoczesny frontend w React z wydajnym backendem w NestJS, zapewniając pełną automatyzację procesu rezerwacji, zarządzania flotą oraz analityki.

## 👥 Zespół Projektowy
* **Nikita Parkovskyi** – Architekt Systemu, Backend Developer & DBA
* **Artur Orfin** – Frontend Developer, UI/UX Designer & QA

## 🛠 Stos Technologiczny
* **Backend:** Node.js (NestJS) + TypeORM + PostgreSQL
* **Frontend:** Next.js 15+ (App Router) + Tailwind CSS v4 + Framer Motion
* **Infrastruktura:** Docker & Docker Compose
* **Design:** Mobile-First, Modern UI, Glassmorphism

## 🚀 Kluczowe Funkcjonalności
* **Trzy Panele Dostępu:** 
  - **Klient:** Rezerwacje, program lojalnościowy (1 km = 1 pkt), historia podróży.
  - **Kierowca:** Mobilny panel do zarządzania listą pasażerów i raportowania tras.
  - **Admin:** Centrum zarządzania trasami, flotą, użytkownikami i analityką finansową.
* **Bezpieczeństwo:** Pessimistic Locking (zapobieganie overbookingowi), walidacje biznesowe (T-2h / T-24h), szyfrowanie haseł.
* **Wydajność:** Pełna konteneryzacja pozwalająca na błyskawiczne wdrożenie środowiska produkcyjnego.

## 📂 Struktura Projektu
```text
KKBus-Management-System/
├── backend/            # API Serwerowe (NestJS)
│   └── src/modules/    # Auth, Reservations, Reports, Schedules
├── frontend-next/      # Nowoczesny Interfejs (Next.js)
│   └── src/app/        # Routing: (public), (auth), (client), (driver), (admin)
├── infra/              # Konfiguracja Docker & PostgreSQL
│   ├── docker-compose  # Orkiestracja całego stosu
│   └── postgres-init/  # Skrypty inicjalizujące schemat i dane (Seed)
└── docs/               # Dokumentacja techniczna i makiety
```

## 🛠 Jak uruchomić?
System jest w pełni skonteneryzowany. Aby uruchomić cały stos technologiczny:

1. Upewnij się, że masz zainstalowany **Docker** i **Docker Compose**.
2. W folderze głównym wykonaj komendę:
   ```bash
   docker-compose -f infra/docker-compose.yml up --build
   ```
3. Aplikacja będzie dostępna pod adresami:
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:3000/api
   - **pgAdmin:** http://localhost:5050 (Zarządzanie bazą)

---
*Projekt realizowany w ramach kamieni milowych rozwoju systemów transportowych.*
