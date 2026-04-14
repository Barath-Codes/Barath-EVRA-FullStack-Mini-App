# EVRA Session Console — Backend

REST API for managing EV charging sessions, meter readings, and anomaly detection.

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18 (tested with v20+)
- **npm** ≥ 9

### Install & Run

```bash
# Dependencies are managed at the root. From the project root, run:
npm install

# Start this Backend dev server independently from the root directory:
npm run dev:api

# Run tests independently from the root:
npm run test:api
```

The server starts on **http://localhost:3000** by default. Override with the `PORT` environment variable.

> **📝 Postman Collection Note:** The attached Postman collection (`EVRA_API.postman_collection.json`) is pre-configured with the base URL set to `http://localhost:3000`. Please note that changing the `PORT` in your `.env` file will **not** automatically update the Postman collection. You will need to manually update the `baseUrl` variable inside Postman if you deviate from port `3000`.

---

## API Endpoints

| Method | Endpoint                    | Description                                   |
|--------|-----------------------------|-----------------------------------------------|
| `POST` | `/sessions/start`           | Start a new charging session                  |
| `POST` | `/sessions/:id/meter`       | Submit a meter reading for an active session  |
| `POST` | `/sessions/:id/stop`        | Stop an active session                        |
| `GET`  | `/sessions/:id`             | Get session details (readings + anomalies)    |
| `GET`  | `/sessions`                 | List sessions (with filtering & pagination)   |
| `GET`  | `/chargers/:id/summary`     | Get charger summary (total energy, sessions)  |
| `GET`  | `/health`                   | Health check                                  |

### Query Parameters — `GET /sessions`

| Param      | Type   | Default | Description                        |
|------------|--------|---------|------------------------------------|
| `chargerId`| string | —       | Filter by charger ID               |
| `status`   | enum   | —       | `Active`, `Completed`, or `Faulted`|
| `page`     | number | `1`     | Page number (1-indexed)            |
| `limit`    | number | `10`    | Results per page (max 100)         |

### Session ID Format

Session IDs are exposed in the API as `s-001`, `s-002`, etc. Internally, they are auto-incrementing integers in the database. The `s-XXX` formatting is applied at the service layer.

---

## Technical Considerations

### Why Express?

Express was chosen as the HTTP framework for its:

- **Maturity & stability** — The most widely-used Node.js framework with extensive community support and middleware ecosystem.
- **Simplicity** — Minimal boilerplate for defining routes, middleware, and error handling. The project's scope (6 RESTful endpoints) doesn't justify the complexity of a more opinionated framework like NestJS.
- **Flexibility** — Easy to layer on middleware (CORS, JSON parsing, auth, error handling) in a clear, composable order.

### Why SQLite (`better-sqlite3`)?

SQLite was chosen over PostgreSQL/MySQL for this project because:

- **Zero setup** — No separate database server to install or configure. The database is a single file (`evra.db`) created automatically on first run.
- **Synchronous API** — `better-sqlite3` provides a synchronous driver, which eliminates callback/promise complexity for simple transactional operations like meter reading + anomaly detection in a single call.
- **Portability** — The entire backend (code + database) is self-contained. Clone, `npm install`, and you're running.


### Why Zod?

Zod was selected for request validation over alternatives like `joi` or `express-validator`:

- **TypeScript-first** — Schemas directly infer TypeScript types (`z.infer<typeof Schema>`), eliminating the need to maintain separate type definitions and validation rules that can drift apart.
- **Composable & chainable** — Schema definitions read like type declarations, making them easy to review and extend.
- **Error handling** — Zod's structured `ZodError` is caught in the global error handler and transformed into `{ error: "VALIDATION_ERROR", message: "..." }` responses automatically.

### Why Vitest?

Vitest was chosen over Jest for testing:

- **Native ESM + TypeScript** — Works seamlessly with TypeScript via Vite's transform pipeline. No need for `ts-jest` or separate Babel configuration.
- **Fast** — Uses Vite's dev server architecture for near-instant test startup.
- **Jest-compatible API** — `describe`, `it`, `expect`, `beforeEach` — the same patterns, virtually zero migration cost.

---

## Error Handling

All errors return a consistent structure:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

| Status | Error Code         | When                                       |
|--------|--------------------|---------------------------------------------|
| `400`  | `VALIDATION_ERROR` | Zod schema validation fails                |
| `400`  | `BAD_REQUEST`      | Invalid session ID format                  |
| `404`  | `NOT_FOUND`        | Session does not exist                     |
| `409`  | `CONFLICT`         | Duplicate active session on same connector |
| `422`  | `INVALID_STATE`    | Action on non-Active session               |
| `500`  | `INTERNAL_ERROR`   | Unhandled server error                     |

---

## Testing

The test suite (`tests/sessions.test.ts`) covers 8 integration tests:

| Test Case | Description |
|-----------|-------------|
| TC-01 | Happy path — Start → Meter → Stop lifecycle |
| TC-02 | Decreasing meter — Anomaly detection & Faulted status |
| TC-03 | Duplicate session — 409 Conflict response |
| TC-04 | Meter on unknown session — 404 |
| TC-05 | Stop without start — 404 |
| TC-06 | Multiple valid meter readings — accumulated correctly |
| TC-07 | Missing required fields — 400 validation |
| TC-08 | Invalid session ID format — 400 |

Tests reset state before each test via `resetDb()`.

> **⚠️ IMPORTANT WARNING:** Due to the current SQLite configuration, running the test cases using `npm run test` or `npm test` will execute `resetDb()` directly against the primary `evra.db` file. **This will completely reset and wipe your local database**. Do not run the tests if you want to preserve your active UI development data!

```bash
npm test
```
