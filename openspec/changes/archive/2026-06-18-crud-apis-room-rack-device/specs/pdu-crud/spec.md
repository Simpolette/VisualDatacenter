## ADDED Requirements

### Requirement: Attach a PDU to a rack
The system SHALL attach a PDU to a rack when a valid `POST /api/v1/racks/:rackId/pdus` request is received with a `CreatePduDTO` containing name, position, and outletCount.

#### Scenario: Valid PDU attachment
- **WHEN** a POST request is sent with `{ "name": "PDU-L1", "position": "LEFT", "outletCount": 24 }` for a rack with no PDU on the LEFT side
- **THEN** the system creates the PDU linked to the rack and returns HTTP 201

#### Scenario: Invalid position value
- **WHEN** a POST request is sent with a position not in {LEFT, RIGHT, REAR}
- **THEN** the system returns HTTP 400 with a validation error

#### Scenario: Duplicate PDU position in rack
- **WHEN** a POST request is sent with position "LEFT" for a rack that already has a PDU at position LEFT
- **THEN** the system returns HTTP 409 with a conflict error

#### Scenario: Maximum PDUs exceeded
- **WHEN** a POST request is sent for a rack that already has 2 PDUs attached
- **THEN** the system returns HTTP 409 with an error indicating max 2 PDUs per rack

#### Scenario: Rack not found
- **WHEN** a POST request is sent for a non-existent rackId
- **THEN** the system returns HTTP 404

### Requirement: Detach a PDU from a rack
The system SHALL remove a PDU when `DELETE /api/v1/pdus/:id` is called.

#### Scenario: Delete existing PDU
- **WHEN** a DELETE request is sent for an existing PDU
- **THEN** the system deletes the PDU and returns HTTP 204

#### Scenario: PDU not found
- **WHEN** a DELETE request is sent for a non-existent PDU id
- **THEN** the system returns HTTP 404
