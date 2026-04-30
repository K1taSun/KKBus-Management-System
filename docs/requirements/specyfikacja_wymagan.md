# Specyfikacja Wymagań Systemowych - Projekt KKBus

<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
## 1. Cel systemu
System ma ogarnąć chaos w firmie transportowej KKBus. Od biletów, przez grafiki, aż po punkty lojalnościowe dla stałych bywalców trasy Kraków-Katowice.

## 2. Analiza użytkowników (Role)

| Rola | Opis | Główne zadania |
| :--- | :--- | :--- |
| **Klient** | Pasażer, który chce dojechać z A do B bez spinania się. | Rezerwacja biletu, podgląd punktów lojalnościowych, historia podróży. |
| **Kierowca** | Człowiek za kółkiem, musi wiedzieć kogo zabrać. | Podgląd grafiku, lista pasażerów na dany kurs, oznaczanie obecności. |
| **Sekretariat** | "Mózg" operacyjny, ogarnia błędy i telefony. | Zarządzanie rezerwacjami, pomoc klientom, edycja kursów. |
| **Właściciel** | Boss, chce widzieć cyferki (hajs). | Generowanie raportów, zarządzanie flotą i kadrą, wgląd w statystyki. |

## 3. Wymagania Funkcjonalne

### 3.1. Moduł Rezerwacji
*   **RF1.1:** System musi pozwalać klientowi wybrać trasę, datę i godzinę kursu.
*   **RF1.2:** Blokowanie miejsc w czasie rzeczywistym (żeby dwie osoby nie usiadły na jednym fotelu - overbooking to zło!).
*   **RF1.3:** Wysyłanie potwierdzenia rezerwacji na maila/kod QR.

### 3.2. Program Lojalnościowy
*   **RF2.1:** Naliczanie punktów: 1 km = 1 punkt (prosta matematyka, żeby się nie pogubić).
*   **RF2.2:** Możliwość wymiany punktów na darmowy przejazd lub inne bajery.

### 3.3. Zarządzanie Flotą i Grafikami
*   **RF3.1:** Przypisywanie kierowców i autobusów do konkretnych kursów.
*   **RF3.2:** Powiadomienia o zbliżających się przeglądach (żeby bus nie stanął w szczerym polu).

### 3.4. Raporty i Analityka
*   **RF4.1:** Wyliczanie rentowności tras.
*   **RF4.2:** Statystyki najpopularniejszych godzin (kiedy studenci wracają do domu).

## 4. Wymagania Niefunkcjonalne

*   **RN1: Bezpieczeństwo:** Hasła szyfrowane bcryptem (nikt nam nie podejrzy haseł "marcin123").
*   **RN2: Wydajność:** Strona ma śmigać na telefonach (Mobile-First), bo nikt nie wyciąga laptopa na przystanku.
*   **RN3: Dostępność:** System ma działać 24/7 (nawet jak serwer płacze, to ma stać).
*   **RN4: Relacyjność:** Dane mają być spójne – nie może być rezerwacji na nieistniejący kurs.

---
