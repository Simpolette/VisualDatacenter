## Context

The Visual Datacenter backend is currently a bare Spring Boot 4.1 (Java 25) application with no domain logic. The project's `docs/design.md` already defines the full entity model (Room, Rack, Device, DeviceType, PDU), API contract (~20 endpoints under `/api/v1`), package structure, and business invariants (U-slot collision detection, rack capacity rules).

This change implements the first backend layer — JPA entities, repositories, services with validation, REST controllers, and DTOs — using the design document as the authoritative specification.

**Current state:**
- `build.gradle` has only `spring-boot-starter` (no web, no JPA, no database driver)
- Single class: `DcvServerApplication.java` in an unconventional package path
- PostgreSQL database assumed but no connection configuration
- No existing domain code, tests, or configuration

## Goals / Non-Goals

**Goals:**
- Implement full CRUD API for Room, Rack, Device, DeviceType, and PDU entities
- Enforce all domain invariants server-side (U-slot collision, rack bounds, PDU limits, unique names)
- Produce a clean, layered architecture: Controller → Service → Repository
- Configure PostgreSQL/JPA connectivity and CORS for frontend dev
- Return consistent error responses via `@ControllerAdvice`

**Non-Goals:**
- Image upload endpoints (floor-plan, device-type images) — deferred to a separate change
- Authentication or authorization — MVP is single-user sandbox
- Frontend integration — this change is backend-only
- Database migration tooling (Flyway/Liquibase) — Hibernate auto-DDL is sufficient for MVP
- Pagination or filtering on list endpoints — defer until data volumes require it

## Decisions

### 1. Package structure: `common/` + `features/` under `DcvServerApplication`

**Decision:** Organize code under the existing `com.simpolette.dcv.DcvServerApplication` base package with two top-level sub-packages:
- `common/` — cross-cutting concerns: exception classes, config (CORS, etc.), validation utilities (SlotValidator)
- `features/` — one sub-package per domain aggregate (room/, rack/, device/, devicetype/, pdu/), each self-contained with Entity, Repository, Service, Controller, and dto/

**Rationale:** Keeps the existing main class package intact (no move needed). Clearly separates shared infrastructure from domain logic. Each feature folder is self-contained and easy to navigate.

**Alternative considered:** Flat feature packages directly under `com.simpolette.dcv` — rejected to keep the existing package path and add clear organizational separation between shared and domain code.

### 2. DTOs as Java records

**Decision:** Use Java records for all request/response DTOs. No Lombok, no MapStruct.

**Rationale:** Java 25 records are immutable, concise, and have built-in `equals`/`hashCode`/`toString`. Eliminates Lombok dependency. Manual mapping in service layer is simple for this domain size.

**Alternative considered:** Lombok `@Data` classes — rejected to reduce dependencies and leverage modern Java features.

### 3. Validation approach: Bean Validation + custom service-layer checks

**Decision:** Use `jakarta.validation` annotations on DTOs for simple constraints (NotBlank, Min, Max). Implement complex invariants (U-slot collision, rack-within-room-bounds, PDU position limits) in dedicated service methods.

**Rationale:** Bean Validation handles the obvious cases declaratively. Domain-specific rules like slot collision require database queries and multi-entity logic that doesn't fit annotation-based validation.

### 4. Cascade deletes via JPA relationships

**Decision:** Room deletion cascades to Racks; Rack deletion cascades to Devices and PDUs. Implemented via `CascadeType.ALL` + `orphanRemoval` on `@OneToMany` relationships.

**Rationale:** Matches the domain model (deleting a room inherently removes its racks and their contents). Simplifies API — no need for clients to manually clean up children first.

**Alternative considered:** Soft deletes — rejected as over-engineering for MVP sandbox.

### 5. Error response contract

**Decision:** All errors return a consistent JSON structure: `{ "status": <int>, "error": <string>, "message": <string>, "timestamp": <iso8601> }`. Handled by a single `@RestControllerAdvice` class.

**Key mappings:**
- `ResourceNotFoundException` → 404
- `SlotConflictException` → 409
- `MethodArgumentNotValidException` → 400 (with field-level detail)
- Unhandled exceptions → 500

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Hibernate auto-DDL may produce suboptimal schema** | Acceptable for MVP; migrate to Flyway before production |
| **No pagination on list endpoints** | Room/Rack/Device counts are small in simulation; add pagination if performance degrades |
| **Cascade deletes are destructive and unrecoverable** | MVP sandbox model accepts this; add confirmation/soft-delete for multi-user production |
| **No concurrent access control** | Single-user MVP; add optimistic locking (`@Version`) when multi-user support is added |
