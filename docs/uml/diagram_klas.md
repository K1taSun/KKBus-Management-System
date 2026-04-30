# Diagram Klas – System KKBus

**Zadanie:** 1.2 | **Czas realizacji:** 4 dni | **Autor:** Nikita Parkovskyi

---

## Diagram klas encji (model domenowy)

```mermaid
classDiagram
    direction TB

    class Role {
        +Int id
        +String name
    }

    class User {
        +UUID id
        +String email
        +String password_hash
        +String first_name
        +String last_name
        +String phone
        +Int role_id
        +Int failed_login_attempts
        +DateTime created_at
        +DateTime updated_at
        +register() void
        +login() String
        +resetLoginAttempts() void
    }

    class Bus {
        +Int id
        +String registration_number
        +String model
        +Int capacity
        +String status
    }

    class Route {
        +Int id
        +String name
        +Int total_distance_km
    }

    class Schedule {
        +Int id
        +Int route_id
        +Int bus_id
        +UUID driver_id
        +DateTime departure_time
        +DateTime arrival_time
        +Decimal price_base
        +getAvailableSeats() Int[]
    }

    class Reservation {
        +UUID id
        +Int schedule_id
        +UUID user_id
        +Int seat_number
        +String status
        +DateTime created_at
        +confirm() void
        +cancel() void
    }

    class LoyaltyPoints {
        +Int id
        +UUID user_id
        +Int points_balance
        +DateTime last_transaction_date
        +addPoints(km: Int) void
        +deductPoints(km: Int) void
    }

    %% Relacje
    Role "1" --> "N" User : przypisuje
    User "1" --> "N" Reservation : składa
    User "1" --> "1" LoyaltyPoints : posiada
    User "1" --> "N" Schedule : prowadzi jako kierowca

    Schedule "1" --> "N" Reservation : zawiera
    Bus "1" --> "N" Schedule : obsługuje
    Route "1" --> "N" Schedule : obowiązuje dla
```

---

## Diagram modułów backendu (NestJS)

```mermaid
classDiagram
    direction LR

    class AppModule {
        +TypeOrmModule
        +AuthModule
        +ReservationsModule
        +SchedulesModule
        +ReportsModule
    }

    class AuthModule {
        +AuthController
        +AuthService
        +JwtStrategy
    }

    class AuthController {
        +POST /auth/register()
        +POST /auth/login()
    }

    class AuthService {
        +register(body) Object
        +login(body) Object
    }

    class ReservationsModule {
        +ReservationsController
        +ReservationsService
    }

    class ReservationsController {
        +POST /reservations()
        +DELETE /reservations/:id()
    }

    class ReservationsService {
        +bookSeat(userId, body) Object
        +cancelReservation(userId, id) Object
    }

    class SchedulesModule {
        +SchedulesController
        +SchedulesService
    }

    class SchedulesController {
        +GET /schedules()
        +GET /schedules/:id()
    }

    class SchedulesService {
        +findAll(query) Schedule[]
        +findOne(id) Schedule
    }

    class ReportsModule {
        +ReportsController
        +ReportsService
    }

    class ReportsController {
        +GET /reports/routes()
        +GET /reports/finance()
    }

    class ReportsService {
        +getRoutePopularity() Object
        +getFinancialEstimate() Object
    }

    AppModule --> AuthModule
    AppModule --> ReservationsModule
    AppModule --> SchedulesModule
    AppModule --> ReportsModule

    AuthModule --> AuthController
    AuthModule --> AuthService
    ReservationsModule --> ReservationsController
    ReservationsModule --> ReservationsService
    SchedulesModule --> SchedulesController
    SchedulesModule --> SchedulesService
    ReportsModule --> ReportsController
    ReportsModule --> ReportsService
```
