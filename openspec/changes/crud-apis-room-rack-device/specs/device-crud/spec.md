## ADDED Requirements

### Requirement: Install a device in a rack
The system SHALL install a device into a specific rack at a given U-slot position when a valid `POST /api/v1/racks/:rackId/devices` request is received with an `InstallDeviceDTO` containing deviceTypeId, startU, and optionally name and face.

#### Scenario: Valid device installation
- **WHEN** a POST request is sent with `{ "deviceTypeId": 1, "name": "Web Server 01", "startU": 5, "face": "FRONT" }` for a rack with slots 5–6 free and deviceType height 2U
- **THEN** the system creates the device occupying U5–U6 on the FRONT face and returns HTTP 201

#### Scenario: Default face to FRONT
- **WHEN** a POST request is sent without specifying a face
- **THEN** the system defaults the face to "FRONT"

#### Scenario: U-slot collision on same face
- **WHEN** a POST request is sent with startU 5 on FRONT face and an existing device already occupies U4–U6 on FRONT
- **THEN** the system returns HTTP 409 with a slot conflict error explaining which slots overlap

#### Scenario: No collision on opposite face
- **WHEN** a POST request is sent with startU 5 on REAR face and an existing device occupies U5–U6 on FRONT
- **THEN** the system successfully installs the device and returns HTTP 201

#### Scenario: Device exceeds rack bounds
- **WHEN** a POST request is sent with startU 41 for a 2U device in a 42U rack (would need U41–U42 but device needs U41–U42, that's fine — let's say startU 42 for a 2U device needing U42–U43)
- **THEN** the system returns HTTP 400 because startU + heightU - 1 exceeds rack totalUnits

#### Scenario: Start U below minimum
- **WHEN** a POST request is sent with startU 0 or a negative value
- **THEN** the system returns HTTP 400 because startU must be >= 1

#### Scenario: Invalid device type
- **WHEN** a POST request is sent with a deviceTypeId that does not exist
- **THEN** the system returns HTTP 404 with a "DeviceType not found" error

#### Scenario: Rack not found
- **WHEN** a POST request is sent for a non-existent rackId
- **THEN** the system returns HTTP 404

### Requirement: Update a device
The system SHALL update a device's name, startU, face, or status when a valid `PUT /api/v1/devices/:id` request is received.

#### Scenario: Move device to new U-slot
- **WHEN** a PUT request is sent with a new startU position where the new range is free
- **THEN** the system updates the device position and returns HTTP 200

#### Scenario: Move causes collision
- **WHEN** a PUT request is sent with a new startU that would overlap with another device on the same face
- **THEN** the system returns HTTP 409 with a slot conflict error

#### Scenario: Update device status
- **WHEN** a PUT request is sent with `{ "status": "MAINTENANCE" }`
- **THEN** the system updates the device status and returns HTTP 200

#### Scenario: Device not found
- **WHEN** a PUT request is sent for a non-existent device id
- **THEN** the system returns HTTP 404

### Requirement: Remove a device from a rack
The system SHALL remove a device when `DELETE /api/v1/devices/:id` is called, freeing the occupied U-slots.

#### Scenario: Delete existing device
- **WHEN** a DELETE request is sent for an existing device
- **THEN** the system deletes the device and returns HTTP 204, and the previously occupied U-slots become available

#### Scenario: Device not found
- **WHEN** a DELETE request is sent for a non-existent device id
- **THEN** the system returns HTTP 404

### Requirement: U-slot collision detection
The system SHALL enforce that no two devices on the same face of the same rack occupy overlapping U-slot ranges. The occupied range for a device is `[startU, startU + deviceType.heightU - 1]`.

#### Scenario: Adjacent devices do not collide
- **WHEN** device A occupies U1–U2 (2U) and device B is placed at U3 (1U) on the same face
- **THEN** the system allows the installation (no overlap)

#### Scenario: Overlapping ranges collide
- **WHEN** device A occupies U1–U4 (4U) and device B (2U) is placed at startU 3 on the same face
- **THEN** the system rejects with HTTP 409 because U3–U4 overlap

#### Scenario: Same slot on different faces does not collide
- **WHEN** device A occupies U1–U2 on FRONT and device B is placed at U1–U2 on REAR
- **THEN** the system allows both installations
