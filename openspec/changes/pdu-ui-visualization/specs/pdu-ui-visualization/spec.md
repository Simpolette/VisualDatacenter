## ADDED Requirements

### Requirement: 3D Zero-U PDU Mesh Rendering
The 3D room visualization engine SHALL render PDU hardware strips attached to the outside of 3D rack enclosures with a light metallic finish according to their position (`LEFT`, `RIGHT`, `REAR`).

#### Scenario: Rendering Zero-U side PDUs
- **WHEN** a rack has PDUs attached at `LEFT` or `RIGHT` positions
- **THEN** vertical light metallic Zero-U PDU meshes SHALL be rendered mounted on the outside left or right side walls of the rack enclosure with outward-facing status LEDs and socket indicators

#### Scenario: Rendering Rear PDUs
- **WHEN** a rack has a PDU attached at the `REAR` position
- **THEN** a light metallic PDU hardware strip SHALL be rendered mounted on the outside rear wall of the 3D rack enclosure with outward-facing sockets

### Requirement: 2D Rack Inspector PDU Management
The 2D rack inspection sidebar SHALL display attached PDUs and allow operators to attach or remove PDUs.

#### Scenario: Displaying attached rack PDUs
- **WHEN** a user opens the 2D rack inspection sidebar for a rack
- **THEN** a PDU management card SHALL display all attached PDUs (`LEFT`, `RIGHT`, `REAR`) with their names and outlet counts

#### Scenario: Attaching a new PDU
- **WHEN** an operator submits the PDU creation form specifying name, position, and outlet count
- **THEN** the system SHALL issue an API call to create the PDU and refresh the 2D inspector and 3D scene viewport

#### Scenario: Deleting an existing PDU
- **WHEN** an operator clicks the delete button on an attached PDU card
- **THEN** the system SHALL issue an API call to remove the PDU and update the 2D inspector and 3D scene viewport
