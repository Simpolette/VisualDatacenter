# Visual Datacenter — Backlog

> **Last updated:** 2026-07-12

This document tracks outstanding work items, improvements, and known issues for the Visual Datacenter project.

---

## 🔴 Critical

### 1. Telemetry Database Overflow at Scale
- **Problem:** With 10,000 devices polled every 5 seconds (5 metrics each), the system writes ~180 million rows/day to the `telemetry_logs` table in PostgreSQL. This produces ~144 GB/day of database growth and will exhaust disk space within hours.
- **Context:** The `telemetry_logs` table is currently a write-only sink — the application never queries it. All real-time UI data flows through in-memory SSE broadcasts.
- **Proposed solution:** Migrate telemetry persistence to TimescaleDB (a PostgreSQL extension for time-series data) to gain automatic compression (10–15x), time-based partitioning, and built-in retention policies. Alternatively, make database persistence optional via a configuration flag.
- **Related files:**
  - `backend/.../telemetry/TelemetrySchedulerService.java` — `@Scheduled(fixedRate = 5000)` loop with `saveAll()`
  - `backend/.../telemetry/TelemetryLog.java` — entity definition
  - `backend/src/main/resources/application.properties` — Hibernate batch config

---

## 🟡 High Priority

### 2. Historical Metrics Charts (Frontend)
- **Description:** Build frontend chart views that allow users to visualize device telemetry history (CPU usage, temperature, RAM, network throughput, power consumption) over configurable time ranges (1h, 24h, 7d, 30d).
- **Depends on:** Item #1 (a time-series storage backend is needed to serve historical queries efficiently).
- **Scope:** New backend API endpoints for querying aggregated historical metrics, plus a chart component in the frontend (e.g., using a charting library like Recharts or Chart.js).

### 3. Adaptive / Configurable Polling Intervals
- **Description:** The current 5-second fixed polling rate is aggressive at scale. Introduce configurable and adaptive polling intervals — e.g., poll idle devices every 60 seconds, but increase to 5–15 seconds for devices with active alarms or devices currently being viewed by a user.
- **Impact:** Reduces database writes, network overhead, and CPU utilization by 90–98% for idle devices.
- **Related files:**
  - `backend/.../telemetry/TelemetrySchedulerService.java` — `@Scheduled(fixedRate = 5000)`

### 4. Telemetry Data Retention Policy
- **Description:** Implement a multi-tier retention strategy for telemetry data:
  - **Raw data (5s granularity):** Keep for 2 days.
  - **Downsampled data (1-minute averages):** Keep for 30 days.
  - **Downsampled data (1-hour averages):** Keep for 365 days.
- **Depends on:** Item #1 (TimescaleDB supports continuous aggregates and retention policies natively).

---

## 🟢 Normal Priority

### 5. User Authentication & Authorization
- **Description:** The system currently operates as a single-user sandbox with no authentication. Implement user login, registration, and role-based access control (RBAC) for multi-user deployments.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

### 6. Cabling & Network Topology Visualization
- **Description:** Visualize network connections and cable paths between devices, racks, and PDUs in the 3D room view.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

### 7. Multi-Room / Multi-Floor Navigation
- **Description:** Support viewing and navigating between multiple server rooms or building floors. The current 3D view is scoped to a single room at a time.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

### 8. Collaborative Multi-User Editing
- **Description:** Allow multiple users to edit the same room layout simultaneously with real-time conflict resolution.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

---

## 🔵 Improvements / Tech Debt

### 9. Database Migration Strategy
- **Description:** The backend currently uses `spring.jpa.hibernate.ddl-auto=update`, which auto-mutates the production schema. Migrate to a proper schema migration tool (e.g., Flyway or Liquibase) for safe, versioned schema changes.
- **Related files:**
  - `backend/src/main/resources/application.properties` — `spring.jpa.hibernate.ddl-auto=update`

### 10. Test Coverage Expansion
- **Description:** Expand backend test coverage toward the 80% target defined in the design document. Current tests cover exception handling and rack repository queries, but service-layer and telemetry tests are missing.
- **Related files:**
  - `backend/src/test/` — existing test directory
  - `docs/design.md` — Quality Gates section (80% line and branch coverage target)
