## ADDED Requirements

### Requirement: Backend rack search API
The system SHALL expose a `GET /api/v1/rooms/{roomId}/racks/search?q={query}` endpoint that performs case-insensitive substring search across rack names, device instance names, device IP addresses, and device type catalog names within a room using expression GIN trigram indexes.

#### Scenario: Searching by rack name
- **WHEN** an operator sends `GET /api/v1/rooms/1/racks/search?q=Row-A`
- **THEN** the system SHALL return all racks in room 1 whose name contains "Row-A" (case-insensitive), each with `rackId`, `rackName`, and `matchedField: "RACK_NAME"`

#### Scenario: Searching by device instance name or IP address
- **WHEN** an operator sends `GET /api/v1/rooms/1/racks/search?q=web-server-01`
- **THEN** the system SHALL return all racks in room 1 containing a device whose name or IP address contains "web-server-01", each with `matchedField: "DEVICE_NAME"`

#### Scenario: Searching by device type name
- **WHEN** an operator sends `GET /api/v1/rooms/1/racks/search?q=PowerEdge`
- **THEN** the system SHALL return all racks in room 1 containing a device whose device type name contains "PowerEdge", each with `matchedField: "DEVICE_TYPE"`

#### Scenario: Empty query
- **WHEN** an operator sends `GET /api/v1/rooms/1/racks/search?q=`
- **THEN** the system SHALL return an empty list

#### Scenario: No results
- **WHEN** an operator sends a query that matches no rack names, device names, or device types
- **THEN** the system SHALL return an empty list with HTTP 200

### Requirement: Frontend search bar with 3D rack highlighting
The frontend SHALL provide a search input in the room header that calls the backend search API with debounced input and visually highlights matched racks in the 3D viewport while dimming unmatched racks.

#### Scenario: Typing a search query
- **WHEN** an operator types "Dell" into the search bar and pauses for 300ms
- **THEN** the system SHALL call the backend search API and highlight matched racks in the 3D scene while dimming all other racks

#### Scenario: Clearing the search
- **WHEN** an operator clears the search input
- **THEN** all racks SHALL return to their normal visual state in the 3D viewport
