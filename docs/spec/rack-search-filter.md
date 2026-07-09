# Rack Search and Filter Specification

## 1. Description
Provides backend-powered search capabilities to locate racks inside datacenter rooms by rack name, device instance name, device IP address, or device type catalog name using PostgreSQL `pg_trgm` GIN trigram indexes, as well as visual capacity utilization filtering (High, Medium, or Low occupancy).

---

## 2. Main Flow

### Search Flow
1.  **Type Input**: The user types a query into the debounced search input box (300ms debounce) in the room header toolbar.
2.  **API Search**: The system issues a request to `GET /api/v1/rooms/{roomId}/racks/search?q={query}`.
3.  **Index Evaluation**: The backend executes a case-insensitive substring search using PostgreSQL `pg_trgm` GIN indexes across `rack.name`, `device.name`, `device.ipAddress`, and `device_type.name`.
4.  **Highlight Matches**: The system returns a list of `RackSearchResultDTO` records (`rackId`, `rackName`, `matchedField`). Matched racks highlight in the 3D viewport, while unmatched racks dim to semi-transparent opacity (`0.15`).
5.  **Clear Search**: Clearing the search input restores all racks to their normal visual state.

### Filter Flow
1.  **Toggle Filters**: The user clicks checkbox toggles for occupancy bands (e.g., High, Medium, Low) in the workspace toolbar or legend.
2.  **Evaluate Utilization**: The system calculates the utilization percentage for all racks:
    $$\text{utilizationPercent} = \left(\frac{\text{occupiedUnits}}{\text{totalUnits}}\right) \times 100$$
3.  **Apply Opacity**:
    *   Racks falling within checked bands remain fully visible.
    *   Racks falling outside checked bands are dimmed (opacity: `0.15`).

---

## 3. Access Control
*   **Authorization Level**: Single-user sandbox model.
*   **Policy**: No server-side authentication required. Full read search access is granted to all API client requests.

---

## 4. Data Model

### RackSearchResultDTO
*   `rackId` (Long, Required)
*   `rackName` (String, Required)
*   `matchedField` (Enum [`RACK_NAME`, `DEVICE_NAME`, `DEVICE_TYPE`], Required)

### Workspace Filters State
*   `searchQuery`: String (Text entered by the user)
*   `searchResults`: List of `RackSearchResultDTO` objects
*   `activeFilters`: Set of active occupancy bands (`HIGH`, `MEDIUM`, `LOW`)

### Utilization Bands
*   `HIGH` (Terracotta red): utilization >= 80%
*   `MEDIUM` (Amber yellow): utilization 50% to 79.9%
*   `LOW` (Sage green): utilization < 50%

---

## 5. Error Scenarios

| Trigger | Condition | Expected System Behavior |
| :--- | :--- | :--- |
| **Search Query** | Empty query string `q=` | Backend returns HTTP 200 with an empty list `[]`. Frontend clears highlights. |
| **Search Query** | Query matches no racks, devices, or device types | Backend returns HTTP 200 with an empty list `[]`. Frontend displays "No matching racks or devices found". |
| **Search Query** | Room ID does not exist | Backend returns HTTP 404 Not Found. |

---

## 6. Constraints
*   **Search Performance**: Search queries must execute in sub-10ms leveraging PostgreSQL GIN trigram indexes on `LOWER(name)` and `LOWER(ip_address)`.
*   **Debounce Input**: Frontend search inputs must be debounced by 300ms to avoid unnecessary API requests while typing.
*   **Dimming Contrast**: Unmatched racks in search or filter views dim to `0.15` opacity, ensuring matched racks stand out clearly.

---

## 7. Acceptance Criteria
*   Typing in the search input box debounces for 300ms and sends `GET /api/v1/rooms/{roomId}/racks/search?q={query}`.
*   Searching by rack name, device name, IP address, or device type returns matching racks tagged with `matchedField` (`RACK_NAME`, `DEVICE_NAME`, or `DEVICE_TYPE`).
*   Matched racks highlight in the 3D scene with cyan edge accents while unmatched racks dim to `0.15` opacity.
*   Clearing the search input box immediately restores all racks to their standard rendering state.
*   Checking/unchecking occupancy bands dims all non-matching racks to `0.15` opacity.
