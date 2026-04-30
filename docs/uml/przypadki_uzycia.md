# Diagramy Przypadków Użycia – System KKBus

**Zadanie:** 1.2 | **Czas realizacji:** 3 dni | **Autor:** Nikita Parkovskyi

---

## 1. Widok globalny systemu

```mermaid
flowchart LR
    subgraph Aktorzy
        K["👤 Klient"]
        KI["🚌 Kierowca"]
        S["🗂️ Sekretariat"]
        W["💼 Właściciel"]
    end

    subgraph System KKBus
        UC1["Rejestracja / Logowanie"]
        UC2["Wyszukiwanie połączeń"]
        UC3["Rezerwacja biletu"]
        UC4["Anulowanie rezerwacji"]
        UC5["Program lojalnościowy"]
        UC6["Podgląd grafiku"]
        UC7["Lista pasażerów kursu"]
        UC8["Zarządzanie rezerwacjami"]
        UC9["Edycja kursów"]
        UC10["Generowanie raportów"]
        UC11["Zarządzanie flotą"]
        UC12["Zarządzanie kadrą"]
    end

    K --> UC1
    K --> UC2
    K --> UC3
    K --> UC4
    K --> UC5

    KI --> UC1
    KI --> UC6
    KI --> UC7

    S --> UC1
    S --> UC8
    S --> UC9

    W --> UC1
    W --> UC10
    W --> UC11
    W --> UC12
```

---

## 2. Szczegółowy diagram – Klient

```mermaid
flowchart TD
    K["👤 Klient"]

    K --> A["UC-K1: Rejestracja konta"]
    K --> B["UC-K2: Logowanie"]
    K --> C["UC-K3: Wyszukiwanie połączeń"]
    K --> D["UC-K4: Rezerwacja biletu"]
    K --> E["UC-K5: Anulowanie rezerwacji"]
    K --> F["UC-K6: Podgląd historii podróży"]
    K --> G["UC-K7: Podgląd salda punktów"]

    D --> D1["«include» Wybór miejsca"]
    D --> D2["«include» Naliczenie punktów lojalnościowych"]
    E --> E1["«include» Odjęcie punktów lojalnościowych"]

    B --> B1["«extend» Blokada po 3 nieudanych próbach"]
```

---

## 3. Szczegółowy diagram – Kierowca

```mermaid
flowchart TD
    KI["🚌 Kierowca"]

    KI --> A["UC-KI1: Logowanie do panelu"]
    KI --> B["UC-KI2: Podgląd własnego grafiku kursów"]
    KI --> C["UC-KI3: Podgląd listy pasażerów na kurs"]
    KI --> D["UC-KI4: Oznaczenie obecności pasażera"]
```

---

## 4. Szczegółowy diagram – Sekretariat

```mermaid
flowchart TD
    S["🗂️ Sekretariat"]

    S --> A["UC-S1: Logowanie do panelu"]
    S --> B["UC-S2: Przeglądanie rezerwacji"]
    S --> C["UC-S3: Edycja rezerwacji klienta"]
    S --> D["UC-S4: Anulowanie rezerwacji klienta"]
    S --> E["UC-S5: Edycja kursów / rozkładu"]
    S --> F["UC-S6: Pomoc telefoniczna klientom"]
```

---

## 5. Szczegółowy diagram – Właściciel

```mermaid
flowchart TD
    W["💼 Właściciel"]

    W --> A["UC-W1: Logowanie do panelu"]
    W --> B["UC-W2: Generowanie raportu popularności tras"]
    W --> C["UC-W3: Generowanie raportu finansowego"]
    W --> D["UC-W4: Zarządzanie flotą autobusów"]
    W --> E["UC-W5: Zarządzanie kierowcami"]
    W --> F["UC-W6: Wgląd w statystyki systemu"]
```

---

## 6. Tabela przypadków użycia

| ID | Nazwa | Aktor | Priorytet |
|---|---|---|---|
| UC-K1 | Rejestracja konta | Klient | Wysoki |
| UC-K2 | Logowanie | Klient, Kierowca, Sekretariat, Właściciel | Wysoki |
| UC-K3 | Wyszukiwanie połączeń | Klient | Wysoki |
| UC-K4 | Rezerwacja biletu | Klient | Wysoki |
| UC-K5 | Anulowanie rezerwacji | Klient | Wysoki |
| UC-K6 | Podgląd historii podróży | Klient | Średni |
| UC-K7 | Podgląd salda punktów | Klient | Średni |
| UC-KI2 | Podgląd grafiku | Kierowca | Wysoki |
| UC-KI3 | Lista pasażerów kursu | Kierowca | Wysoki |
| UC-S3 | Edycja rezerwacji | Sekretariat | Wysoki |
| UC-S5 | Edycja kursów | Sekretariat | Wysoki |
| UC-W2 | Raport popularności tras | Właściciel | Wysoki |
| UC-W3 | Raport finansowy | Właściciel | Wysoki |
| UC-W4 | Zarządzanie flotą | Właściciel | Średni |
