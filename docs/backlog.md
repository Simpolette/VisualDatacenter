# Visual Datacenter — Backlog

> **Last updated:** 2026-07-14

This document tracks outstanding work items, improvements, and known issues for the Visual Datacenter project.

---

## 🟡 High Priority

### 1. Historical Metrics Charts (Frontend UI)
- **Description:** Build the frontend chart views to allow users to visualize device telemetry history (CPU usage, temperature, RAM, network throughput, power consumption) over configurable time ranges (1h, 24h, 7d, 30d).
- **Status:** Backend API aggregation endpoints are complete (`GET /api/v1/telemetry/history/{deviceId}`). Needs frontend integration.
- **Scope:** Create a new Zustand store or extend existing telemetry stores to query the history endpoint, and implement a chart component (using a library like Recharts or Chart.js) inside the device inspection panel.

### 2. Adaptive / Configurable Polling Intervals
- **Description:** The current 5-second fixed polling rate is aggressive at scale. Introduce configurable and adaptive polling intervals — e.g., poll idle devices every 60 seconds, but increase to 5–15 seconds for devices with active alarms or devices currently being viewed by a user.
- **Impact:** Reduces database writes, network overhead, and CPU utilization by 90–98% for idle devices.
- **Related files:**
  - `backend/.../telemetry/TelemetrySchedulerService.java` — `@Scheduled(fixedRate = 5000)`

### 3. Telemetry Data Retention Policy (Continuous Aggregates)
- **Description:** Implement a multi-tier retention strategy for telemetry data:
  - **Raw data (5s granularity):** Keep for 2 days.
  - **Downsampled data (1-minute averages):** Keep for 30 days.
  - **Downsampled data (1-hour averages):** Keep for 365 days.
- **Status:** Baseline TimescaleDB retention is set up for 7 days. This task involves configuring continuous aggregate views in TimescaleDB to support downsampling for longer retention.

---

## 🟢 Normal Priority

### 4. User Authentication & Authorization
- **Description:** The system currently operates as a single-user sandbox with no authentication. Implement user login, registration, and role-based access control (RBAC) for multi-user deployments.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

### 5. Cabling & Network Topology Visualization
- **Description:** Visualize network connections and cable paths between devices, racks, and PDUs in the 3D room view.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

### 6. Multi-Room / Multi-Floor Navigation
- **Description:** Support viewing and navigating between multiple server rooms or building floors. The current 3D view is scoped to a single room at a time.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

### 7. Collaborative Multi-User Editing
- **Description:** Allow multiple users to edit the same room layout simultaneously with real-time conflict resolution.
- **Status:** Explicitly out of scope for MVP (see `docs/proposal.md`).

---

## 🔵 Improvements / Tech Debt

### 8. Test Coverage Expansion
- **Description:** Expand backend test coverage toward the 80% target defined in the design document. Current tests cover exception handling and rack repository queries, but service-layer and telemetry tests are missing.
- **Related files:**
  - `backend/src/test/` — existing test directory
  - `docs/design.md` — Quality Gates section (80% line and branch coverage target)

