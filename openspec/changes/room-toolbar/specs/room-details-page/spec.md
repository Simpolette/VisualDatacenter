## MODIFIED Requirements

### Requirement: Room details layout and navigation
The application SHALL render a details page for a room when the user navigates to `/rooms/:id`. The page SHALL integrate the room's name, floor location, and physical dimensions directly into a unified top toolbar. It SHALL display aggregate statistics (total racks and overall occupancy rate) as a floating overlay pill within the 3D viewport, removing any separate standalone page header.

#### Scenario: Navigating to room details page
- **WHEN** the user navigates to `/rooms/1`
- **THEN** the application fetches the room with ID 1, displays its metadata inside the integrated top toolbar, overlays the total racks and occupancy statistics inside the 3D viewport, and removes the standalone page header.

## ADDED Requirements

### Requirement: Unified workspace toolbar switches and controls
The top toolbar SHALL contain interactive switches to control the grid helper, rack labels, and camera view.

#### Scenario: Toggling floor grid
- **WHEN** the user toggles the grid switch in the toolbar
- **THEN** the system shows or hides the simplified single-level 1.0m × 1.0m grid on the room floor

#### Scenario: Toggling rack labels
- **WHEN** the user toggles the labels switch in the toolbar
- **THEN** the system shows or hides the text labels above all 3D rack meshes

#### Scenario: Resetting camera view
- **WHEN** the user clicks the reset view button in the toolbar
- **THEN** the camera smoothly glides back to the default general room overview target
