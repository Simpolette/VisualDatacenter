## Context

The current system loads all racks for a room via `GET /api/v1/rooms/{roomId}/racks`, but provides no search capability. At scale (200+ racks, 10,000+ devices), operators need a fast way to locate racks by name, device instance name, IP address, or device type without scanning the 3D scene visually. The frontend does not eagerly load device details for all racks, so search must be server-side.

## Goals / Non-Goals

**Goals:**
- Sub-10ms backend search across rack names (`rack.name`), device names (`device.name`), device IP addresses (`device.ipAddress`), and device type names (`device_type.name`) within a room using PostgreSQL `pg_trgm` trigram indexing on `LOWER(column)`.
- Debounced frontend search bar (300ms) in `RoomDetailsHeader` that highlights matched racks in the 3D viewport.
- Reuse the existing isolation/dimming visual pattern in `RackMesh.tsx` for search result highlighting.

**Non-Goals:**
- Full-text search with relevance scoring (Elasticsearch).
- Cross-room global search (search is scoped to the currently viewed room).
- Fuzzy/typo-tolerant matching beyond what `pg_trgm` ILIKE / LIKE provides natively.

## Decisions

### Decision 1: PostgreSQL `pg_trgm` expression indexes on `LOWER(column)`
- **Choice**: Use `pg_trgm` extension with expression GIN indexes on `LOWER(rack.name)`, `LOWER(device.name)`, and `LOWER(device_type.name)`.
- **Alternative**: Elasticsearch cluster or standard non-expression indexes.
- **Rationale**: Expression GIN trigram indexes match JPQL `LOWER(col) LIKE LOWER(...)` queries directly in PostgreSQL query planner, triggering Bitmap Index Scans for fast sub-10ms substring lookups.

### Decision 2: Backend search endpoint scoped to room
- **Choice**: `GET /api/v1/rooms/{roomId}/racks/search?q={query}` returns `List<RackSearchResultDTO>`.
- **Alternative**: Frontend in-memory filtering of pre-loaded data.
- **Rationale**: The frontend only loads rack summaries (no device details) on page entry. Device names live in the database, so searching by device requires a server round-trip. Room-scoped keeps the query fast and avoids cross-room permission concerns.

### Decision 3: Search result DTO with match context
- **Choice**: `RackSearchResultDTO(Long rackId, String rackName, String matchedField)` — where `matchedField` is `"RACK_NAME"`, `"DEVICE_NAME"`, or `"DEVICE_TYPE"`.
- **Rationale**: The frontend needs to know which racks matched (to highlight them) and can display match counts in the search bar.

### Decision 4: Reuse isolation dimming for 3D highlighting
- **Choice**: Read `searchMatchedRackIds` from `useRackStore` in `RackMesh` and reuse `isElevated` scale animation and cyan edge highlights (`#00f0ff` / `#38bdf8`).
- **Alternative**: New custom shader or outline effect.
- **Rationale**: The spotlight/isolation visual system already handles "these racks are active, dim the rest." Search highlighting reuses this exact pattern seamlessly.

## Risks / Trade-offs

- **[Risk] `pg_trgm` extension not enabled** → Mitigation: `DatabaseInitConfig` auto-executes `CREATE EXTENSION IF NOT EXISTS pg_trgm` on startup.
- **[Risk] Auto-DDL doesn't create GIN indexes** → Mitigation: `DatabaseInitConfig` creates `idx_rack_name_trgm`, `idx_device_name_trgm`, and `idx_device_type_name_trgm` via `JdbcTemplate`.
