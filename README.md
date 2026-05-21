# KKBus - Zintegrowany System Zarządzania Firmą Transportową

![Licencja](https://img.shields.io/badge/licencja-MIT-green)
![Technologie](https://img.shields.io/badge/stack-NestJS%20%7C%20Next.js%20%7C%20PostgreSQL-blue)
![Docker](https://img.shields.io/badge/docker-ready-cyan)

**Projekt realizowany w ramach:**  
Katedra Informatyki Stosowanej M-7  
Wydział Mechaniczny, Politechnika Krakowska im. T. Kościuszki

## 🚌 O Projekcie
KKBus to profesjonalna platforma transportowa zaprojektowana dla firmy **KKBus sp. z o.o.**, obsługującej pasażerów na trasie **Kraków ↔ Katowice**. Celem systemu jest usprawnienie obsługi klientów oraz automatyzacja codziennych działań firmy. Aplikacja umożliwia kompleksową obsługę rezerwacji przejazdów, zarządzanie pracownikami, pojazdami i raportami.

Specyfikacja systemu stanowi podstawę do projektowania i implementacji zaawansowanego narzędzia wspierającego procesy biznesowe przewoźnika.

## 👥 Zespół Projektowy
* **Nikita Parkovskyi** – Architekt Systemu, Backend Developer & DBA
* **Artur Orfin** – Frontend Developer, UI/UX Designer & QA

## 🛠 Stos Technologiczny
Zgodnie z wymaganiami nowoczesnych aplikacji webowych, system został zrealizowany w następujących technologiach *(względem początkowych założeń specyfikacji opartych na PHP, zaktualizowano stos na bardziej wydajny i nowoczesny)*:
* **Backend:** Node.js (NestJS) + TypeORM + PostgreSQL
* **Frontend:** Next.js 15+ (App Router) + Tailwind CSS v4 + Framer Motion
* **Infrastruktura:** Docker & Docker Compose
* **Design:** Mobile-First, Modern UI, Glassmorphism

## 🚀 Kluczowe Funkcjonalności i Role w Systemie
Aplikacja została zaprojektowana z myślą o czterech głównych grupach użytkowników (aktorach):

1. **Klient:**
   - Rejestracja i logowanie (przeglądanie i edycja danych).
   - Rezerwacja miejsc (najpóźniej 2h przed odjazdem) oraz anulowanie (najpóźniej 24h przed).
   - Przystąpienie do programu lojalnościowego (1 km = 1 punkt) i wymiana punktów na nagrody/zniżki.
   - Przeglądanie informacji o trasach, firmie i cenniku (dostępne również bez logowania).

2. **Kierowca:**
   - Podgląd własnego grafiku pracy (przypisane trasy i kursy).
   - Zgłaszanie dyspozycyjności do pracy (dostępność/niedostępność).
   - Dostęp do listy pasażerów przypisanych do kursu.
   - Generowanie raportu z kursu (liczba pasażerów, koszt paliwa, przebieg) po jego zakończeniu.

3. **Pracownik Sekretariatu:**
   - Tworzenie i edycja grafików pracy kierowców oraz przypisywanie pojazdów do tras/kursów.
   - Generowanie raportów z kursów, rezerwacji oraz wyników finansowych.
   - Zakładanie kont klientów z poziomu panelu pracowniczego.
   - Podgląd zgłoszonej dyspozycyjności kierowców.

4. **Właściciel (Administrator):**
   - Pełne zarządzanie użytkownikami (klientami i pracownikami).
   - Zarządzanie flotą pojazdów, trasami i kursami.
   - Modyfikacja cennika oraz zasad i progów w programie lojalnościowym.
   - Tworzenie grafików pracy i wgląd we wszystkie raporty analityczne oraz logi systemowe.

## 🔐 Wymagania Niefunkcjonalne
* **Wydajność:** Czas reakcji do 3 sekund, obsługa jednoczesnego dostępu 30-50 użytkowników.
* **Dostępność:** Działanie online 24/7 (maksymalny czas niedostępności: 1 godzina miesięcznie).
* **Bezpieczeństwo:** Certyfikat HTTPS, zaszyfrowane hasła, blokowanie konta po 3 błędnych próbach.
* **Niezawodność:** Codzienne automatyczne kopie zapasowe, czas przywrócenia po awarii do 30 min.

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
