## ADDED Requirements

### Requirement: List all device types
The system SHALL return all device types in the catalog when `GET /api/v1/device-types` is called.

#### Scenario: Device types exist
- **WHEN** the catalog contains Server, Switch, and Storage device types
- **THEN** the system returns HTTP 200 with a JSON array of all device types including id, name, category, heightU, widthMm, depthMm, weightKg, imagePath, and createdAt

#### Scenario: No device types exist
- **WHEN** the catalog is empty
- **THEN** the system returns HTTP 200 with an empty array

### Requirement: Create a device type
The system SHALL add a new device type to the catalog when a valid `POST /api/v1/device-types` request is received with a `CreateDeviceTypeDTO`.

#### Scenario: Valid device type creation
- **WHEN** a POST request is sent with `{ "name": "Dell R740", "category": "COMPUTE", "heightU": 2, "widthMm": 482.0, "depthMm": 734.0, "weightKg": 24.5 }`
- **THEN** the system creates the device type and returns HTTP 201 with the created record

#### Scenario: Height below minimum
- **WHEN** a POST request is sent with heightU of 0 or negative
- **THEN** the system returns HTTP 400 because heightU must be >= 1

#### Scenario: Invalid category
- **WHEN** a POST request is sent with a category not in {COMPUTE, NETWORK, STORAGE}
- **THEN** the system returns HTTP 400 with a validation error

#### Scenario: Missing required name
- **WHEN** a POST request is sent without a name
- **THEN** the system returns HTTP 400

### Requirement: Update a device type
The system SHALL update a device type's properties when a valid `PUT /api/v1/device-types/:id` request is received.

#### Scenario: Valid update
- **WHEN** a PUT request is sent with `{ "name": "Dell R750", "heightU": 2 }` for an existing device type
- **THEN** the system updates the device type and returns HTTP 200

#### Scenario: Device type not found
- **WHEN** a PUT request is sent for a non-existent device type id
- **THEN** the system returns HTTP 404

### Requirement: Delete a device type
The system SHALL delete a device type when `DELETE /api/v1/device-types/:id` is called, provided no devices reference it.

#### Scenario: Delete unused device type
- **WHEN** a DELETE request is sent for a device type that no devices reference
- **THEN** the system deletes the device type and returns HTTP 204

#### Scenario: Delete device type in use
- **WHEN** a DELETE request is sent for a device type that is referenced by existing devices
- **THEN** the system returns HTTP 409 with a conflict error explaining the device type is in use

#### Scenario: Device type not found
- **WHEN** a DELETE request is sent for a non-existent device type id
- **THEN** the system returns HTTP 404
