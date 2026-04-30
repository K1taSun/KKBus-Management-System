# Kamień Milowy: Gotowy Projekt Systemu

**Data osiągnięcia:** 22 kwietnia 2026  
**Etap:** 1 – Analiza i Projekt Systemu  
**Status:** ✅ OSIĄGNIĘTY

---

## Zakres Etapu 1

Etap 1 obejmował dwa zadania realizowane w zależności Finish-Start (FS):

### Zadanie 1.1 – Analiza Wymagań Systemowych
- **Czas trwania:** 1 tydzień
- **Odpowiedzialny:** Nikita Parkovskyi, Artur Orfin
- **Deliverable:** [`docs/requirements/specyfikacja_wymagan.md`](../requirements/specyfikacja_wymagan.md)
- **Zakres:**
  - Identyfikacja funkcjonalności systemu (moduły: rezerwacje, lojalność, flota, grafiki, raporty)
  - Analiza ról użytkowników (Klient, Kierowca, Sekretariat, Właściciel)
  - Wymagania niefunkcjonalne (bezpieczeństwo, wydajność, dostępność, spójność danych)

### Zadanie 1.2 – Projekt Systemu i Bazy Danych
- **Czas trwania:** 12 dni (zależność FS od 1.1)
- **Odpowiedzialny:** Nikita Parkovskyi
- **Deliverables:**
  - Diagramy przypadków użycia (3 dni) → [`docs/uml/przypadki_uzycia.md`](../uml/przypadki_uzycia.md)
  - Diagram klas (4 dni) → [`docs/uml/diagram_klas.md`](../uml/diagram_klas.md)
  - Projekt bazy danych i konfiguracja środowiska (5 dni) → [`docs/erd/projekt_bazy_danych.md`](../erd/projekt_bazy_danych.md)

---

## Kryteria Akceptacji (Definition of Done)

| Kryterium | Status |
|---|---|
| Specyfikacja wymagań funkcjonalnych (RF1–RF4) udokumentowana | ✅ |
| Specyfikacja wymagań niefunkcjonalnych (RN1–RN4) udokumentowana | ✅ |
| Role systemowe zidentyfikowane i opisane | ✅ |
| Diagramy przypadków użycia dla każdej roli | ✅ |
| Diagram klas encji systemu | ✅ |
| Model ERD bazy danych KKBusDB (6 tabel, relacje, klucze) | ✅ |
| Środowisko deweloperskie skonfigurowane (Docker + PostgreSQL) | ✅ |

---

## Wejście do Etapu 2

Po osiągnięciu tego kamienia milowego uruchomiono równolegle:
- **Zadanie 2.1** – Implementacja bazy danych (tworzenie tabel, relacje, dane testowe)
- **Zadanie 2.2** – Implementacja logiki backend (Nikita Parkovskyi: auth, rezerwacje)
- **Etap 3** – Implementacja UI (Artur Orfin: makiety, panele użytkowników)
