## 1. Backend Infrastructure

- [x] 1.1 Enable `pg_trgm` extension and create GIN indexes on `rack.name` and `device_type.model` via `@PostConstruct` or `schema.sql`
- [x] 1.2 Create `RackSearchResultDTO` Java record (`rackId`, `rackName`, `matchedField`)

## 2. Backend Search Endpoint

- [x] 2.1 Add native `@Query` search method in `RackRepository` joining `rack → device → device_type` with `ILIKE` on name, model, manufacturer
- [x] 2.2 Add `searchInRoom(Long roomId, String query)` method in `RackService`
- [x] 2.3 Add `GET /api/v1/rooms/{roomId}/racks/search?q=` endpoint in `RackController`

## 3. Frontend Search UI

- [x] 3.1 Add `searchRacks(roomId, query)` action in `useRackStore.ts`
- [x] 3.2 Add debounced search input bar in `RoomDetailsHeader.tsx`
- [x] 3.3 Pass `searchMatchedRackIds` to `RoomScene3D` and `RackMesh` to highlight matched racks and dim unmatched racks

## 4. Verification

- [x] 4.1 Verify backend compiles with `./gradlew build`
- [x] 4.2 Verify frontend compiles with `npx tsc --noEmit`
