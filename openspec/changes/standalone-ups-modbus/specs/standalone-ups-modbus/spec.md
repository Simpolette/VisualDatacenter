## ADDED Requirements

### Requirement: 3D Standalone Floor UPS Cabinet Rendering
The 3D room visualization engine SHALL render a wide (1.4m width x 2.0m height x 1.0m depth) standalone UPS power cabinet mesh on the room floor with a bright metallic silver finish (`#e2e8f0`), active status LEDs, and a digital battery gauge screen.

#### Scenario: Viewing room in 3D scene
- **WHEN** an operator views the 3D room viewport
- **THEN** a bright metallic silver standalone UPS floor cabinet SHALL be rendered at designated room power coordinates (`x = 1.0m, z = 1.0m`) with active status indicators

### Requirement: Interactive Modbus UPS Telemetry Inspection Sidebar
The system SHALL provide an interactive right-side slide-in telemetry inspector sidebar when clicking the 3D UPS cabinet to display real-time Modbus telemetry stream metrics.

#### Scenario: Clicking the UPS cabinet
- **WHEN** an operator clicks the 3D UPS cabinet mesh
- **THEN** a Modbus Telemetry Inspector sidebar SHALL slide in from the right edge displaying real-time metrics (`BATTERY_LEVEL`, `INPUT_VOLTAGE`, `OUTPUT_VOLTAGE`, `UPS_LOAD`, `TEMPERATURE`), connected PDU feed lines, and active alarms
