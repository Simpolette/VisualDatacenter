## ADDED Requirements

### Requirement: List racks in a room
The system SHALL return all racks belonging to a specific room when `GET /api/v1/rooms/:roomId/racks` is called.

#### Scenario: Room has racks
- **WHEN** a GET request is sent for a room with 3 racks
- **THEN** the system returns HTTP 200 with a JSON array of all 3 racks including their id, name, totalUnits, posX, posY, rotationDeg, and timestamps

#### Scenario: Room has no racks
- **WHEN** a GET request is sent for a room with no racks
- **THEN** the system returns HTTP 200 with an empty array

#### Scenario: Room does not exist
- **WHEN** a GET request is sent with a non-existent roomId
- **THEN** the system returns HTTP 404 with a "Room not found" error

### Requirement: Create a rack in a room
The system SHALL create a new rack in a specific room when a valid `POST /api/v1/rooms/:roomId/racks` request is received with a `CreateRackDTO`.

#### Scenario: Valid rack creation
- **WHEN** a POST request is sent with `{ "name": "RACK-A01", "totalUnits": 42, "posX": 2.5, "posY": 3.0, "rotationDeg": 0 }` for an existing room
- **THEN** the system creates the rack linked to the room and returns HTTP 201

#### Scenario: Invalid total units
- **WHEN** a POST request is sent with totalUnits not in {42, 44}
- **THEN** the system returns HTTP 400 with a validation error

#### Scenario: Duplicate rack name in room
- **WHEN** a POST request is sent with a name that already exists in the same room
- **THEN** the system returns HTTP 409 with a conflict error

#### Scenario: Room does not exist
- **WHEN** a POST request is sent for a non-existent roomId
- **THEN** the system returns HTTP 404

### Requirement: Get rack with devices and PDUs
The system SHALL return a rack with its installed devices and attached PDUs when `GET /api/v1/racks/:id` is called, returning a `RackDetailDTO` that includes freeUnits and occupiedUnits counts.

#### Scenario: Rack exists with devices
- **WHEN** a GET request is sent for a rack that has 3 devices and 1 PDU
- **THEN** the system returns HTTP 200 with the rack details including the devices array, pdus array, freeUnits, and occupiedUnits

#### Scenario: Rack does not exist
- **WHEN** a GET request is sent for a non-existent rack id
- **THEN** the system returns HTTP 404

### Requirement: Update a rack
The system SHALL update a rack's name, position, or rotation when a valid `PUT /api/v1/racks/:id` request is received.

#### Scenario: Valid rack update
- **WHEN** a PUT request is sent with `{ "name": "RACK-B02", "posX": 5.0, "posY": 4.0 }`
- **THEN** the system updates the rack and returns HTTP 200 with the updated data

#### Scenario: Rack not found
- **WHEN** a PUT request is sent for a non-existent rack id
- **THEN** the system returns HTTP 404

### Requirement: Delete a rack with cascade
The system SHALL delete a rack and all its devices and PDUs when `DELETE /api/v1/racks/:id` is called.

#### Scenario: Delete rack with contents
- **WHEN** a DELETE request is sent for a rack containing devices and PDUs
- **THEN** the system deletes the rack and all its contents and returns HTTP 204

#### Scenario: Rack not found
- **WHEN** a DELETE request is sent for a non-existent rack id
- **THEN** the system returns HTTP 404

### Requirement: Get rack utilization
The system SHALL return U-slot usage statistics when `GET /api/v1/racks/:id/utilization` is called, including totalUnits, occupiedUnits, freeUnits, and utilizationPercent.

#### Scenario: Partially filled rack
- **WHEN** a GET request is sent for a 42U rack with devices occupying 18 U-slots
- **THEN** the system returns HTTP 200 with `{ "totalUnits": 42, "occupiedUnits": 18, "freeUnits": 24, "utilizationPercent": 42.86 }`

#### Scenario: Empty rack
- **WHEN** a GET request is sent for a rack with no devices
- **THEN** the system returns HTTP 200 with occupiedUnits 0, freeUnits equal to totalUnits, and utilizationPercent 0.0
