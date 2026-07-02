## ADDED Requirements

### Requirement: Isolation mode toolbar toggle
The unified workspace toolbar SHALL include an "Isolate" toggle button with a focus icon. The button SHALL enter `ISOLATION_SELECT` mode when clicked from `NORMAL` mode, and return to `NORMAL` mode when clicked from `ISOLATION_SELECT` or `ISOLATION_VIEW` mode.

#### Scenario: Entering isolation select mode
- **WHEN** the user clicks the "Isolate" button while in `NORMAL` workspace mode
- **THEN** the system transitions `workspaceMode` to `ISOLATION_SELECT`, deselects any currently selected rack, disables manual camera orbit controls, and visually activates the Isolate button with an accent highlight

#### Scenario: Exiting isolation mode
- **WHEN** the user clicks the "Isolate" button while in `ISOLATION_SELECT` or `ISOLATION_VIEW` mode
- **THEN** the system transitions `workspaceMode` back to `NORMAL`, clears `isolatedRackIds`, restores all rack meshes to their standard full-height appearance, re-enables camera orbit controls, and resets the camera to the default room overview

### Requirement: Rack flattening in isolation select mode
When `ISOLATION_SELECT` mode is active, all rack meshes in the 3D viewport SHALL animate down to flat floor footprint markers to reveal the ground-plane layout without vertical obstruction.

#### Scenario: Racks flatten on entering isolation select
- **WHEN** the system enters `ISOLATION_SELECT` mode
- **THEN** every rack mesh smoothly transitions its Y-scale from `1.0` to `0.01` and its Y-position from `RACK_HEIGHT / 2` to `0.005` over approximately 125ms using frame-rate-independent linear interpolation, resulting in a flat rectangular outline on the floor at each rack's original XZ position

#### Scenario: Flattened rack visual appearance
- **WHEN** a rack mesh is in its flattened footprint state
- **THEN** it SHALL render with reduced opacity (`0.15`) and retain its original utilization-based color tint to remain identifiable

### Requirement: Drag-to-select bounding box on floor plane
In `ISOLATION_SELECT` mode, the user SHALL be able to click and drag on the room floor plane to draw a rectangular selection area. Rack footprints whose center coordinates fall within the selection rectangle SHALL be visually highlighted.

#### Scenario: Drawing a selection rectangle
- **WHEN** the user presses the pointer down on the floor plane and drags in `ISOLATION_SELECT` mode
- **THEN** the system renders a semi-transparent blue selection rectangle mesh on the floor plane spanning from the pointer-down world coordinate to the current pointer world coordinate

#### Scenario: Highlighting racks within selection bounds
- **WHEN** the selection rectangle is being drawn and a rack's `(posX, posY)` coordinate falls within the rectangle's axis-aligned bounding box
- **THEN** the rack's floor footprint SHALL visually highlight with an accent border color to indicate it is within the selection

#### Scenario: Confirming selection on pointer release
- **WHEN** the user releases the pointer after drawing a selection rectangle containing one or more rack footprints
- **THEN** the system stores the selected rack IDs in `isolatedRackIds`, transitions `workspaceMode` to `ISOLATION_VIEW`, and removes the selection rectangle mesh

#### Scenario: Empty selection cancels
- **WHEN** the user releases the pointer after drawing a selection rectangle that contains zero rack footprints
- **THEN** the system remains in `ISOLATION_SELECT` mode without changing `isolatedRackIds`, and removes the selection rectangle mesh

### Requirement: Isolated rack elevation and non-selected suppression
In `ISOLATION_VIEW` mode, racks in the `isolatedRackIds` list SHALL smoothly elevate to full height while all other racks remain as flat floor footprints.

#### Scenario: Isolated racks elevate to full height
- **WHEN** the system enters `ISOLATION_VIEW` mode with one or more racks in `isolatedRackIds`
- **THEN** the isolated rack meshes smoothly transition their Y-scale from `0.01` back to `1.0` and their Y-position from `0.005` to `RACK_HEIGHT / 2`, restoring full opacity and their standard visual appearance (utilization coloring, wireframe outline)

#### Scenario: Non-selected racks stay flat
- **WHEN** the system is in `ISOLATION_VIEW` mode
- **THEN** all racks NOT in `isolatedRackIds` SHALL remain as flat floor footprints with `0.15` opacity

#### Scenario: Clicking an isolated rack opens its details
- **WHEN** the user clicks on an elevated isolated rack mesh in `ISOLATION_VIEW` mode
- **THEN** the system sets `selectedRackId` to that rack, opens the 2D Rack Inspector sidebar, and transitions the camera to face that rack's front, while maintaining the isolation state for all other racks

### Requirement: Camera auto-framing on isolated group
When entering `ISOLATION_VIEW` mode, the camera SHALL automatically transition to frame the group of isolated racks.

#### Scenario: Camera frames the isolated group
- **WHEN** the system enters `ISOLATION_VIEW` mode with `isolatedRackIds` containing one or more racks
- **THEN** the camera smoothly transitions to look at the centroid of the isolated racks' positions at a distance proportional to the spatial spread of the group, elevated slightly above rack center height
