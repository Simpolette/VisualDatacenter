## ADDED Requirements

### Requirement: Define component templates on DeviceType
The system SHALL allow users and seeds to define interface templates, console port templates, and power port templates when creating or updating a DeviceType.

#### Scenario: Create a DeviceType with component templates
- **WHEN** a POST request is made to `/api/v1/device-types` with lists of interface templates, console port templates, and power port templates
- **THEN** the system SHALL create the DeviceType along with all associated component templates

### Requirement: Auto-instantiate components on Device placement
The system SHALL automatically instantiate live interfaces, console ports, and power ports on a Device when it is created or installed in a rack, using the templates defined in its DeviceType.

#### Scenario: Auto-creation of ports upon device placement
- **WHEN** a Device is created and assigned to a rack unit
- **THEN** the system SHALL copy all component templates from its DeviceType to populate the live ports for that specific Device instance
