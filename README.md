# FreeConcert — Full-Stack Developer Assignment

A full-stack concert ticket reservation platform built with **Next.js** (frontend) and **NestJS** (backend), backed by **PostgreSQL** and containerized with **Docker Compose**.

## Quick Start (Docker)

```bash
docker compose up --build
```

Services:

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:3001 |
| Backend   | http://localhost:4000/api |
| PostgreSQL| localhost:5433 |

Migrations run automatically when the backend container starts.

> **Port conflicts:** If `3000` or `5432` are already in use on your machine, this project maps the frontend to **3001** and PostgreSQL to **5433** by default.

### Demo flow

1. Open http://localhost:3001
2. Register as **ADMIN** or **USER**
3. **Admin**: create/delete concerts and view the audit trail at `/admin`
4. **User**: browse concerts, reserve one seat per concert, cancel, and view history at `/dashboard`

## Local Development (without Docker app containers)

### 1. Start PostgreSQL

```bash
docker compose up postgres -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Backend modules

- **Auth** — register/login, JWT issuance with role in payload
- **Concerts** — admin create/delete, shared listing with availability metadata
- **Reservations** — user reserve/cancel/history, admin audit trail
- **Guards** — `AuthGuard('jwt')` + `RolesGuard` protect routes by role

### Frontend pages

- `/` landing page
- `/login`, `/register` authentication
- `/dashboard` user concert discovery + reservations
- `/admin` admin concert management + audit trail

### Database schema

- `users` — email, password hash, role (`ADMIN` | `USER`)
- `concerts` — name, description, total seats
- `reservations` — user/concert relation, status (`ACTIVE` | `CANCELLED`)
- Partial unique index prevents more than one **active** reservation per user/concert

## Library List

### Backend
- NestJS, TypeORM, PostgreSQL (`pg`)
- Passport JWT, `@nestjs/jwt`
- class-validator / class-transformer
- bcrypt
- Jest

### Frontend
- Next.js 15 (App Router), React 19
- Tailwind CSS + custom CSS (`globals.css`)
- Native `fetch` API client with toast-based error feedback

### Infrastructure
- Docker, Docker Compose
- PostgreSQL 16

## API Endpoints

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Register account |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/concerts` | USER, ADMIN | List concerts |
| POST | `/api/concerts` | ADMIN | Create concert |
| DELETE | `/api/concerts/:id` | ADMIN | Delete concert |
| POST | `/api/reservations` | USER | Reserve seat |
| DELETE | `/api/reservations/:id` | USER | Cancel reservation |
| GET | `/api/reservations/my` | USER | Personal history |
| GET | `/api/reservations/audit` | ADMIN | Full audit trail |

## Testing

### Backend unit tests

```bash
cd backend
npm install
npm test
```

Coverage includes:
- Concert CRUD availability calculations
- Reservation success, duplicate booking, sold-out, and cancel edge cases

### Frontend tests

```bash
cd frontend
npm install
npm test
```

Coverage includes:
- `StatCard` and `Modal` component rendering/interaction
- `LoginForm` submit flow, redirects, and API validation errors
- `AppNavbar` visibility rules and auth links
- `ToastContainer` display and dismiss behavior
- `apiRequest` success and error handling

## Validation & Error Handling

- Backend uses **class-validator** with a global `ValidationPipe`
- Invalid payloads return `400 Bad Request` with readable messages
- Unauthorized/forbidden roles return `401` / `403`
- Frontend catches API errors and shows **toast notifications** plus inline form errors

## Bonus: Performance Optimization

If traffic and dataset size grow significantly:

1. **Database indexing** — indexes on `reservations(concert_id, status)` and unique active `(user_id, concert_id)` are already in place; add pagination and search indexes for concert name if needed.
2. **Caching** — cache read-heavy concert listings in Redis with short TTL; invalidate on create/delete/reservation changes.
3. **CDN** — serve static frontend assets and marketing pages through a CDN.
4. **Read replicas** — route listing/history queries to PostgreSQL replicas.
5. **API pagination** — avoid returning unbounded concert/history lists.
6. **Horizontal scaling** — run multiple stateless NestJS instances behind a load balancer.

## Bonus: Concurrency Control

Reservation creation uses a **database transaction** with **pessimistic write lock** on the concert row:

1. Lock the concert record
2. Count active reservations
3. Reject if full
4. Insert reservation

Additional safeguards:

- Partial unique index on active `(user_id, concert_id)` prevents duplicate user bookings
- Transaction isolation prevents over-booking under concurrent requests

For very high contention (e.g. 1,000 users booking the last 10 seats), I would also consider:

- **Optimistic locking** with version column on concerts
- **Queue-based booking** (Redis/RabbitMQ) to serialize hot-concert requests
- **Database constraints** such as a materialized seat counter checked in the same transaction


## Notes

- Figma design integrated — blue/gray palette, admin sidebar, stats cards, tables, modals
- Change `JWT_SECRET` before production deployment.
- Register separate ADMIN and USER accounts for testing both flows.
