# room-details-page Specification

## Purpose
TBD - created by archiving change room-details-page. Update Purpose after archive.
## Requirements
### Requirement: Room details layout and navigation
The application SHALL render a details page for a room when the user navigates to `/rooms/:id`. The page SHALL display the room's name and physical dimensions.

#### Scenario: Navigating to room details page
- **WHEN** the user navigates to `/rooms/1`
- **THEN** the application fetches the room with ID 1 and displays its name and dimensions

### Requirement: 3D floor plan visualization
The Room Details page SHALL render a 3D floor plan representing the room's dimensions and the positions of all racks in the room.

#### Scenario: Rendering the 3D scene
- **WHEN** the Room Details page loads successfully
- **THEN** the application renders a 3D canvas with a floor plane scaled to widthM and depthM, and fetches and renders all room racks at their posX and posY coordinates

#### Scenario: Zooming and rotating the scene
- **WHEN** the user drags or scrolls on the 3D scene canvas
- **THEN** the OrbitControls adjust the camera zoom, rotation, and panning dynamically

### Requirement: Rack capacity-based coloring
The 3D rack mesh SHALL reflect its capacity utilization dynamically using muted, clay-like colors.

#### Scenario: Rack occupancy is high
- **WHEN** a rack has utilization >= 80%
- **THEN** the rack mesh is colored muted terracotta red (`hsl(350, 45%, 45%)`)

#### Scenario: Rack occupancy is medium
- **WHEN** a rack has utilization between 50% and 80%
- **THEN** the rack mesh is colored muted amber yellow (`hsl(40, 45%, 45%)`)

#### Scenario: Rack occupancy is low
- **WHEN** a rack has utilization < 50%
- **THEN** the rack mesh is colored muted sage green (`hsl(145, 25%, 35%)`)

### Requirement: Active selection styling
The selected rack SHALL be visually distinguished in the 3D scene using active highlights.

#### Scenario: A rack is selected
- **WHEN** the user selects a rack
- **THEN** the rack mesh color changes to Blender orange (`#e67e22`), the wireframe outline turns bright gold (`#ffae19`), and the text label changes to an orange-themed style.

### Requirement: Room floor grid helper
The application SHALL render a room floor helper to facilitate spacing and layout reference.

#### Scenario: Grid visibility is enabled
- **WHEN** the grid helper is enabled
- **THEN** the system renders a simplified, single-level grid of $1.0\text{m} \times 1.0\text{m}$ cells on top of the dark grey (`#222222`) floor.

### Requirement: Rack selection triggers camera transition
Clicking a rack mesh in the 3D scene SHALL set the selected rack, animate the camera to focus straight on the rack's front face, and open the 2D rack editor sidebar.

#### Scenario: Clicking a rack triggers transition
- **WHEN** the user clicks a rack mesh in the 3D canvas
- **THEN** the system sets selectedRackId, disables manual OrbitControls, smoothly transitions the camera to center on the rack facing it flatly, and slides open the 2D rack editor sidebar

### Requirement: Rack Manager 2D sidebar panel
The application SHALL display a 2D slide-out sidebar for the selected rack, showing its U-slot utilization and installed devices.

#### Scenario: Sidebar displays U-slots and devices
- **WHEN** selectedRackId is not null
- **THEN** the sidebar fetches rack details from `GET /api/v1/racks/:id` and displays a vertical grid of U-slots (1 to totalUnits) from bottom to top, with installed devices highlighted across their occupied slots (startU to startU + heightU - 1)

#### Scenario: Closing the sidebar
- **WHEN** the user clicks the close button in the sidebar or presses Esc
- **THEN** selectedRackId is set back to null, the sidebar slides shut, and manual camera OrbitControls are re-enabled

