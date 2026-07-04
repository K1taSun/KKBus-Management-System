# 🚌 KKBus - Zintegrowany System Zarządzania Firmą Transportową

![Licencja](https://img.shields.io/badge/licencja-MIT-green?style=for-the-badge)
![NestJS](https://img.shields.io/badge/backend-NestJS%20v10-red?style=for-the-badge&logo=nestjs)
![NextJS](https://img.shields.io/badge/frontend-Next.js%20v16-black?style=for-the-badge&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL%20v16-blue?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/docker-ready-cyan?style=for-the-badge&logo=docker)

**Projekt realizowany w ramach:**  
Katedra Informatyki Stosowanej M-7, Wydział Mechaniczny  
Politechnika Krakowska im. T. Kościuszki  
*Autorzy:* **Nikita Parkovskyi** (Backend & DBA) oraz **Artur Orfin** (Frontend & QA)

---

## 📖 O Projekcie

**KKBus** to kompleksowy system zarządzania i rezerwacji dla firmy przewozowej obsługującej kluczową trasę **Kraków ↔ Katowice**. Aplikacja eliminuje papierowy obieg dokumentów i automatyzuje kluczowe procesy biznesowe: od rezerwacji biletów przez pasażerów, przez zgłaszanie gotowości i raportowanie zużycia paliwa przez kierowców, aż po zaawansowane planowanie grafików, zarządzanie flotą i analitykę finansową.

---

## 🛠️ Architektura i Stos Technologiczny

Projekt został zaprojektowany w architekturze monorepozytorium z wyraźnym podziałem na usługi backendowe i dedykowane interfejsy dla każdego z aktorów systemu:

*   **Backend API:** Node.js z frameworkiem **NestJS** (v10), wykorzystujący **TypeORM** do komunikacji z bazą. Bezpieczeństwo zapewnia uwierzytelnianie oparte o ciasteczka **HttpOnly JWT** (AccessToken/RefreshToken) oraz hasła hashowane algorytmem **bcrypt**.
*   **Baza Danych:** **PostgreSQL** (v16) uruchomiony w kontenerze Docker. Schemat i dane początkowe (Seed) są w pełni zautomatyzowane w skryptach SQL w katalogu `infra/`.
*   **Interfejsy Użytkownika (Next.js v16 + Tailwind CSS v4 + Framer Motion):**
    1.  **Panel Klienta (frontend-next):** Rezerwacje biletów, wyszukiwarka połączeń, program lojalnościowy i profil klienta.
    2.  **Panel Kierowcy (frontend-driver):** Podgląd grafiku, manifest pasażerów (zgodny z RODO), zgłaszanie dyspozycyjności i raportowanie tras.
    3.  **Panel Sekretariatu (frontend-secretariat):** Planowanie kursów, przydział pojazdów/kierowców, rejestracja klientów i zarządzanie flotą.
    4.  **Panel Właściciela (frontend-owner):** Zaawansowane audyty logów, statystyki finansowe, zarządzanie pracownikami oraz edycja polityki cenowej.

---

## 🚀 Role w Systemie i Ich Uprawnienia

| Rola | Kluczowe Funkcjonalności |
| :--- | :--- |
| **Pasażer / Klient** | Wyszukiwanie kursów, rezerwacja miejsc do 2h przed odjazdem, anulowanie rezerwacji do 24h przed kursem, program lojalnościowy (zbieranie punktów za przebyte kilometry 1km = 1pkt), wymiana punktów na kody rabatowe. |
| **Kierowca** | Podgląd osobistego grafiku, manifest pasażerów (bez danych RODO), zgłaszanie dyspozycyjności (statusy: *Dostępny, Niedostępny, Urlop, Zwolnienie*), składanie raportów po kursie (zużycie paliwa, koszt, faktyczni pasażerowie). |
| **Pracownik Sekretariatu** | Układanie grafików dla kierowców, przydział autobusów do kursów, monitorowanie stanu pojazdów, zakładanie kont klientom, podgląd raportów. |
| **Właściciel (Admin)** | Pełne zarządzanie kontami (aktywowanie, zawieszanie), edycja tras i cenników (polityka discountów), statystyki finansowe i zużycia paliwa, dostęp do logów audytowych. |

---

## 📸 Zrzuty Ekranu (Prezentacja Systemu)

### 1. Panel Klienta (frontend-next)
<p align="center">
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.49.29.png" alt="Strona główna - wyszukiwanie połączeń" width="48%" />
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.49.46.png" alt="Strona główna - mapa połączeń" width="48%" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.50.12.png" alt="Interaktywne filtry sieci połączeń" width="48%" />
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.54.04.png" alt="Dashboard klienta i punkty lojalnościowe" width="48%" />
</p>
<p align="center">
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.51.10.png" alt="Rejestracja nowego pasażera" width="31%" />
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.51.17.png" alt="Logowanie pasażera" width="31%" />
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.53.45.png" alt="Potwierdzenie rejestracji i karta klienta" width="31%" />
</p>

---

### 2. Panel Kierowcy (frontend-driver)
<p align="center">
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.39.53.png" alt="Dashboard kierowcy z listą kursów" width="31%" />
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.40.08.png" alt="Kalendarz deklaracji dyspozycyjności" width="31%" />
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.40.18.png" alt="Zgłaszanie awarii pojazdu" width="31%" />
</p>

---

### 3. Panel Sekretariatu (frontend-secretariat)
<p align="center">
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.54.36.png" alt="Panel sekretariatu - rezerwacje i status floty" width="90%" />
</p>

---

### 4. Panel Właściciela (frontend-owner)
<p align="center">
  <img src="screenshots/Screenshot%202026-07-04%20at%2022.55.54.png" alt="Panel właściciela - statystyki i dziennik zdarzeń audit log" width="90%" />
</p>

---


## 📂 Struktura Projektu

```text
KKBus-Management-System/
├── backend/                  # Serwer API (NestJS)
│   ├── src/modules/          # Moduły dziedzinowe (auth, reservations, schedules, loyalty, itp.)
│   └── src/common/           # Filtry wyjątków, sensory i interceptory
├── frontend-next/            # Panel Klienta (Next.js - port 3001)
├── frontend-driver/          # Panel Kierowcy (Next.js - port 4040)
├── frontend-secretariat/      # Panel Sekretariatu (Next.js - port 1010)
├── frontend-owner/            # Panel Właściciela (Next.js - port 5050)
├── infra/                    # Infrastruktura Docker i PostgreSQL
│   ├── docker-compose.yml    # Plik orkiestracji kontenerów
│   └── postgres-init/        # Skrypty SQL (tworzenie tabel, dane startowe, cenniki)
├── tests/                    # Automatyczny Pakiet Testowy (Testing Suite)
│   ├── unit/                 # Testy jednostkowe (Jest)
│   ├── integration/          # Testy integracyjne API (Supertest + Mock-DB)
│   ├── e2e/                  # Scenariusze przepływu danych (Axios na żywym API)
│   └── performance/          # Testy SLA i obciążenia (50 współbieżnych połączeń)
├── docs/                     # Dokumentacja techniczna i diagramy
├── start.sh                  # Skrypt automatyzujący uruchamianie środowiska
└── README.md                 # Główna dokumentacja projektu
```

---

## 🛠️ Jak Uruchomić?

Upewnij się, że masz zainstalowany program **Docker** oraz **Node.js** (jeśli uruchamiasz lokalnie).

### Opcja 1: Uruchomienie Wszystkiego w Dockerze (Docker-Only)
Idealne do szybkiego przetestowania aplikacji bez instalowania lokalnych zależności:
```bash
chmod +x start.sh
./start.sh
```
Wybierz opcję **[1]** w menu. Aplikacja zbuduje wszystkie obrazy i uruchomi serwisy.
*   **Aplikacja Klienta:** http://localhost:3000

---

### Opcja 2: Uruchomienie w Trybie Hybrydowym (Zalecane do Developmentu)
Baza danych działa w tle w Dockerze, a backend i panele frontendowe działają lokalnie z automatycznym przeładowywaniem kodu (Hot Reload):
```bash
./start.sh
```
Wybierz opcję **[2]** w menu. Skrypt automatycznie uruchomi kontener bazy danych w tle, a następnie otworzy osobne okna terminala macOS i uruchomi w nich backend oraz poszczególne panele:
*   **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
*   **Panel Klienta:** [http://localhost:3001](http://localhost:3001)
*   **Panel Sekretariatu:** [http://localhost:1010](http://localhost:1010)
*   **Panel Kierowcy:** [http://localhost:4040](http://localhost:4040)
*   **Panel Właściciela:** [http://localhost:5050](http://localhost:5050)

Aby zatrzymać wszystkie uruchomione w tle kontenery, uruchom `./start.sh` i wybierz opcję **[3]**.

---

## 🧪 Automatyczny Pakiet Testowy (Testing Suite)

System posiada w pełni zintegrowany zestaw testów znajdujący się w katalogu `tests/`.

### 1. Podział Testów:
*   **Unit (Jednostkowe):** 119 testów weryfikujących reguły biznesowe w pełnej izolacji (walidacja wieku pasażera >13 lat, naliczanie zniżek, blokowanie kont brute-force, strefy czasowe dostępności kierowców).
*   **Integration (Integracyjne):** Sprawdzenie poprawności kontrolerów, filtrów wyjątków NestJS i serializacji obiektów DTO przy zautomatyzowanym mockowaniu zapytań SQL.
*   **E2E (Scenariuszowe):** Przepływy end-to-end na żywej bazie danych. Testowana jest pełna rejestracja użytkownika, logowanie przez ciasteczka, wyszukanie wolnego kursu, poprawna rezerwacja miejsca, pobranie historii i anulowanie rezerwacji.
*   **Performance (Wydajnościowe):** Symulacja 50 współbieżnych użytkowników odpytujących rozkład jazdy w celu weryfikacji warunków **SLA (< 3 sekund)**.

### 2. Uruchomienie Testów i Automatyczne Sprzątanie Bazy:
Przejdź do folderu `tests/` lub użyj skryptu głównego:
```bash
chmod +x tests/run-all-tests.sh
./tests/run-all-tests.sh
```
**Kluczowe mechanizmy testowe:**
1.  **Rozwiązanie problemu zablokowanych miejsc:** W bazie danych zamiast sztywnego ograniczenia `UNIQUE (schedule_id, seat_number)` zastosowano indeks częściowy:
    ```sql
    CREATE UNIQUE INDEX unique_active_reservation ON reservations (schedule_id, seat_number) WHERE (status != 'Anulowana');
    ```
    Dzięki tomu miejsca anulowane mogą być natychmiastowo zarezerwowane ponownie przez innych klientów, co eliminuje błędy duplikacji klucza.
2.  **Automatyczne czyszczenie (Purge):** Na samym końcu przebiegu testów, skrypt automatycznie usuwa z bazy danych PostgreSQL wszelkie konta i rekordy powiązane z testami dynamicznymi (wszystkie rekordy o e-mailu zaczynającym się od `e2e.`), pozostawiając bazę danych w nienaruszonym stanie.
3.  **Raportowanie:** Wynik jest zapisywany w czytelnym raporcie tekstowym [tests/test-report.txt](file:///Users/_k1tasun_/Documents/GitHub/KKBus-Management-System/tests/test-report.txt).

---

## 📄 Licencja

Projekt jest udostępniany na warunkach licencji **MIT**. Szczegóły znajdują się w pliku `LICENSE`.
