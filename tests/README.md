# 🚌 KKBus Testing Suite - Pakiet Testowy

Niniejszy folder zawiera kompletny pakiet testowy dla zintegrowanego systemu zarządzania firmą transportową **KKBus**. Testy zostały posegregowane za typami w celu ułatwienia konserwacji i uruchamiania.

## 📂 Struktura Folderów

```text
tests/
├── README.md                # Niniejsza dokumentacja
├── package.json             # Zależności npm i skrypty uruchomieniowe
├── tsconfig.json            # Konfiguracja TypeScript dla testów
├── jest.config.json         # Konfiguracja wieloprojektowa dla Jest
├── run-all-tests.sh         # Skrypt powłoki uruchamiający wszystkie testy
├── unit/                    # Testy jednostkowe (w pełnej izolacji, bez bazy)
│   ├── auth.service.spec.ts
│   └── reservations.service.spec.ts
├── integration/             # Testy integracyjne (routing, DTO, filtry, mock-DB)
│   ├── setup.ts
│   ├── auth.integration.spec.ts
│   └── reservations.integration.spec.ts
├── e2e/                     # Scenariusze E2E (wykonywane na działającym serwerze API)
│   ├── run-e2e.ts           # Uruchamiacz scenariuszy E2E z autodetekcją serwera
│   ├── client-booking.scenario.ts
│   └── brute-force-lockout.scenario.ts
└── performance/             # Testy wydajnościowe i zgodności z SLA
    └── load-test.ts         # Pomiar latencji dla 50 współbieżnych użytkowników
```

---

## ⚙️ Wymagania Przed Uruchomieniem

1. **Testy Jednostkowe & Integracyjne:**
   - Nie wymagają żadnych zewnętrznych serwisów (baza danych TypeORM jest w pełni zautomatyzowana za pomocą mocków w `setup.ts`).
   - Wymagają zainstalowania lokalnych zależności w folderze `tests/` za pomocą `npm install`.

2. **Testy Scenariuszowe E2E & Wydajnościowe:**
   - Wymagają **uruchomionego serwera backendu API** pod adresem `http://localhost:3000/api`.
   - Możesz uruchomić serwer lokalnie za pomocą skryptu głównego `./start.sh` w głównym katalogu (wybierając opcję hybrydową lub Docker-Only).
   - *Uwaga:* Skrypty E2E i wydajnościowe posiadają zabezpieczenie – jeżeli serwer jest wyłączony, wypiszą ostrzeżenie i zakończą się pomyślnie (pomijając te kroki), zamiast przerywać całe budowanie.

---

## 🚀 Jak Uruchomić Testy?

### Opcja 1: Uruchomienie Wszystkich Testów (Rekomendowane)

Wykonaj skrypt główny w terminalu z poziomu folderu głównego lub `tests/`:

```bash
chmod +x tests/run-all-tests.sh
./tests/run-all-tests.sh
```

Skrypt automatycznie zainstaluje zależności, uruchomi wszystkie testy i wygeneruje przejrzysty plik podsumowania `tests/test-report.txt`.

### Opcja 2: Uruchamianie Poszczególnych Typów Testów

Przejdź do folderu `tests/` i użyj odpowiedniej komendy npm:

```bash
cd tests
npm install   # Wymagane przed pierwszym uruchomieniem
```

* **Tylko testy jednostkowe:**
  ```bash
  npm run test:unit
  ```

* **Tylko testy integracyjne:**
  ```bash
  npm run test:integration
  ```

* **Tylko scenariusze E2E:**
  ```bash
  npm run test:e2e
  ```

* **Tylko testy wydajnościowe (Load Test):**
  ```bash
  npm run test:perf
  ```
