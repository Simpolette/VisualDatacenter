## ADDED Requirements

### Requirement: Elevated Spotlight Rack Elevation
When a rack is selected in the 3D scene viewport, the system SHALL keep only the selected rack elevated while smoothly scaling all unselected racks down to low floor tiles.

#### Scenario: Selecting a rack in 3D viewport
- **WHEN** a user clicks a rack to open its inspector
- **THEN** the selected rack SHALL remain elevated at full 3D height (`scale.y = 1.0`) while all other racks in the room smoothly scale down to flat floor tiles (`scale.y = 0.01`)

#### Scenario: Deselecting a rack
- **WHEN** a user closes the 2D rack inspector or clicks empty room floor space
- **THEN** all racks SHALL smoothly elevate back to full height (`scale.y = 1.0`)
