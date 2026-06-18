## ADDED Requirements

### Requirement: List all rooms
The system SHALL return a list of all datacenter rooms when the `GET /api/v1/rooms` endpoint is called.

#### Scenario: No rooms exist
- **WHEN** there are no rooms in the database
- **THEN** the system returns HTTP 200 with an empty JSON array `[]`

#### Scenario: Multiple rooms exist
- **WHEN** rooms "Room A" and "Room B" exist
- **THEN** the system returns HTTP 200 with a JSON array containing both rooms with their id, name, location, dimensions, and timestamps

### Requirement: Create a room
The system SHALL create a new datacenter room when a valid `POST /api/v1/rooms` request is received with a `CreateRoomDTO` body containing name, widthM, depthM, and optionally location and heightM.

#### Scenario: Valid room creation
- **WHEN** a POST request is sent with `{ "name": "DC-1", "widthM": 10.0, "depthM": 8.0, "heightM": 3.0, "location": "Building A" }`
- **THEN** the system creates the room and returns HTTP 201 with the created room including a generated id and timestamps

#### Scenario: Missing required fields
- **WHEN** a POST request is sent without a name or with widthM/depthM missing
- **THEN** the system returns HTTP 400 with field-level validation errors

#### Scenario: Duplicate room name
- **WHEN** a POST request is sent with a name that already exists
- **THEN** the system returns HTTP 409 with a conflict error message

#### Scenario: Invalid dimensions
- **WHEN** a POST request is sent with widthM <= 0 or depthM <= 0
- **THEN** the system returns HTTP 400 with a validation error

### Requirement: Get room with details
The system SHALL return a room with its racks summary when the `GET /api/v1/rooms/:id` endpoint is called, returning a `RoomDetailDTO` that includes rack count, total capacity in U-slots, and used U-slots.

#### Scenario: Room exists
- **WHEN** a GET request is sent for an existing room id
- **THEN** the system returns HTTP 200 with the room details including its racks array, rackCount, totalCapacityU, and usedU

#### Scenario: Room does not exist
- **WHEN** a GET request is sent for a non-existent room id
- **THEN** the system returns HTTP 404 with a "Room not found" error

### Requirement: Update a room
The system SHALL update an existing room's properties when a valid `PUT /api/v1/rooms/:id` request is received.

#### Scenario: Valid update
- **WHEN** a PUT request is sent with `{ "name": "DC-1 Updated", "widthM": 12.0, "depthM": 10.0 }` for an existing room
- **THEN** the system updates the room and returns HTTP 200 with the updated room data and an updated `updatedAt` timestamp

#### Scenario: Room not found for update
- **WHEN** a PUT request is sent for a non-existent room id
- **THEN** the system returns HTTP 404

### Requirement: Delete a room with cascade
The system SHALL delete a room and all its associated racks (and their devices and PDUs) when `DELETE /api/v1/rooms/:id` is called.

#### Scenario: Delete existing room
- **WHEN** a DELETE request is sent for a room that contains racks with devices
- **THEN** the system deletes the room, all its racks, and all devices/PDUs in those racks, and returns HTTP 204

#### Scenario: Delete non-existent room
- **WHEN** a DELETE request is sent for a non-existent room id
- **THEN** the system returns HTTP 404
