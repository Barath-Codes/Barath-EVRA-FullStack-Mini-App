# EVRA Session Management Console (Fullstack Application)

## Project Overview

The EVRA Session Management Console is a comprehensive full-stack application designed to track, manage, and monitor Electric Vehicle (EV) charging sessions.

## Quick Start (Monorepo Setup)

This project has been structured as a native npm workspace monorepo. To start the entire stack:

```bash
# 1. Install all workspaces and root dependencies
npm install

# 2. Boot up both the frontend and backend concurrently
npm run dev
```

## Supplementary Project Materials

For better visibility into the operational characteristics of this system, we have included the following artifacts within the project directory:

- 📊 **[Database Schema Diagram](./EVRA-Database-ERD-schema.png):** A visual representation of the relationships handling EV chargers, sessions, meter readings, and anomalous events.
- 🚀 **[Postman Collection](./EVRA_API.postman_collection.json):** A pre-configured collection containing request structures that you can import directly into Postman to test API constraints easily.

---

## Data Model

The application revolves around tracking physical charging lifecycles and telemetry:

1. **`sessions` table:** The core entity representing a single EV charging event.
   - Binds to a specific `charger_id` and `connector_id`, tracking the `id_tag`.
   - Maintains an active lifecycle via `status` (`Active` / `Completed` / `Faulted`).
   - Keeps a running `total_energy_wh` accumulator to streamline and prevent costly aggregation lookups for the UI.
2. **`meter_readings` table:** The temporal telemetry data for the session.
   - Maps one-to-many from `sessions`. Stores specific `energy_wh` check-ins alongside highly defined `timestamp` strings.
3. **`anomalies` table:** The diagnostic audit log attached directly to the session. 
   - Tracks severe lifecycle validation breaks (e.g., `DECREASING_METER` or `DUPLICATE_SESSION`), storing dynamic contextual information inside a stringified JSON `details` column.

## Choice of Storage Layer

**SQLite (via `better-sqlite3`)** was chosen as the primary data store precisely due to the scoped nature of the application. 

- **Why SQLite?** It delivers genuine relational SQL consistency without requiring external infrastructure (like a Postgres daemon or complicated Docker containers). This ensures out-of-the-box local developer momentum just by running `npm i`.
- **Why `better-sqlite3`?** It provides a highly optimized, strictly synchronous execution API interface bridging Node.js. This fundamentally removes complex Promise chains during straightforward synchronous transactional validations (e.g., uploading a meter reading and immediately assessing it for anomalies).

## Known Limitations & Trade-offs

1. **Database Write Bottlenecking:** While SQLite reads are spectacular, concurrent writes utilize file locks. At thousands of simultaneous charging events, REST calls could queue and throttle.
2. **Test Suite Destruction:** Executing `npm run test` executes logic that completely resets the `evra.db` database, aggressively cleaning your active frontend testing data due to the lack of an isolated test execution environment.
3. **Pagination Scalability:** Broad `/sessions` API route pagination is built using standard SQL `OFFSET`. Deep-level offsets on massive log tables generally degrade in performance over large timescales.

## What I Would Add With More Time

- **Production-Ready Database:** Migrating the storage layer from local SQLite onto a fully scalable system (like **PostgreSQL**, **MySQL**, or **MongoDB**) to comfortably handle heavily concurrent telemetry inserts across thousands of simulated chargers.
- **Charger Management Model:** Introducing a dedicated `chargers` table seamlessly coupled with a frontend UI to onboard new chargers, managing their physical state, and relationally linking them strongly to all user sessions and downstream anomalies.
- **WebSockets / Server-Sent Events:** Moving away from standard REST polling for meter reads and replacing it with real-time socket connections for a highly organic, live-ticking UI tracker.
- **Isolated Testing Databases:** Automating test scripts to construct an episodic `evra.test.db` file or pushing it to `:memory:` so you can test safely alongside heavy UI development.
- **Authentication & Roles:** Wrapping critical endpoints in JSON Web Token (JWT) layers so rogue users cannot illegally submit `stopSession` commands for someone else's charger slot.
- **Metrics Visualizations:** Implementing rich plotting libraries like **Recharts** to visualize the energy dispensing curve of a single session or cross-comparing entire chargers dynamically.

---
## Sub-Project Documentation

For specific framework knowledge, local development procedures, and isolated technical documentation, please refer directly to the individual `README.md` files located in their respective workspace directories:

- 🖥️ **[Frontend (Web) Documentation](./apps/web/README.md)** — React / Vite tooling, component structures, and start scripts.
- ⚙️ **[Backend (API) Documentation](./apps/api/README.md)** — Express Router configuration, API error handling, and robust SQLite setup.