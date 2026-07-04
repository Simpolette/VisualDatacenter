## Why

Operators managing rooms with hundreds of racks and thousands of devices have no way to locate a specific rack or device without visually scanning the entire 3D scene. A backend-powered search endpoint with PostgreSQL `pg_trgm` trigram indexing enables instant rack/device lookup by rack name, device name, IP address, or device type — even at 10,000+ device scale — without overloading the frontend with eager data loading.

## What Changes

- **Backend Search API (`GET /api/v1/rooms/{roomId}/racks/search?q=`)**:
  - New endpoint that performs case-insensitive substring search across `rack.name`, `device.name`, `device.ipAddress`, and `device_type.name` within a room.
  - Returns matching rack IDs and names with match context (which field matched: `RACK_NAME`, `DEVICE_NAME`, or `DEVICE_TYPE`).
  - Uses PostgreSQL `pg_trgm` extension with GIN indexes on `LOWER(column)` for sub-10ms query performance.
- **Frontend Search Bar in `RoomDetailsHeader`**:
  - Debounced search input that calls the backend search API.
  - Matched racks are visually highlighted in the 3D viewport with cyan edges; unmatched racks smoothly flatten (reusing isolation-style visual logic).
- **Search Result DTO**:
  - `RackSearchResultDTO` record containing `rackId`, `rackName`, and `matchedField`.

## Capabilities

### New Capabilities
- `rack-device-search`: Backend search endpoint and frontend search UI for finding racks by name or by their installed devices and device types.

### Modified Capabilities
- None.

## Impact

- **Backend**:
  - `RackRepository.java`: `searchRacksInRoom` `@Query` method searching `rack.name`, `device.name`, `device.ipAddress`, `device_type.name`.
  - `RackService.java`: `searchInRoom(roomId, query)` method mapping matched racks to DTOs.
  - `RackController.java`: `GET /api/v1/rooms/{roomId}/racks/search` endpoint.
  - `dto/RackSearchResultDTO.java`: Response record.
  - `DatabaseInitConfig.java`: Auto-configures `pg_trgm` extension and GIN indexes on `LOWER(name)` for `rack`, `device`, and `device_type`.
- **Frontend**:
  - `RoomDetailsHeader.tsx`: Debounced search input bar with match count badge.
  - `useRackStore.ts`: `searchRacks(roomId, query)` and `clearSearch()` actions.
  - `RackMesh.tsx`: Highlight matched racks with cyan edges (`#00f0ff` / `#38bdf8`), dim unmatched racks.
