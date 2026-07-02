## MODIFIED Requirements

### Requirement: Room details layout and navigation
The application SHALL render a details page for a room when the user navigates to `/rooms/:id`. The page SHALL support switching the viewport layout between Normal mode and Add Rack placement mode.

#### Scenario: Entering Add Rack placement mode
- **WHEN** the user clicks the "+ Add Rack" button in the room toolbar
- **THEN** the workspace enters placement mode, displays a top status bar with Cancel actions, disables standard rack selection, and shows a 3D ghost rack snapping to the floor grid.

## ADDED Requirements

### Requirement: Click-and-drag grid placement interaction
The 3D canvas viewport SHALL support interactive click-and-drag gestures to position and orient new racks on the floor grid plane. The grid and floor coordinates SHALL align perfectly with room boundaries using the bottom-left corner of the room floor as the origin (0, 0, 0) in world space, preventing fractional or half-tiles on odd dimensions.

#### Scenario: Snapping ghost rack to grid
- **WHEN** the user moves the pointer over the room floor in placement mode
- **THEN** a semi-transparent ghost rack mesh snaps to the nearest 1.0m grid coordinate relative to the bottom-left origin.

#### Scenario: Defining position and orientation by drag gesture
- **WHEN** the user clicks down on a grid cell and drags the mouse in a direction
- **THEN** the system locks the rack start coordinates `(posX, posY)`, disables OrbitControls, snaps the rack's `rotationDeg` to 90-degree increments matching the drag direction, and dynamically sizes the rack length up to a maximum of 4 cells (4.0m) based on the drag distance.

#### Scenario: Completing placement gesture
- **WHEN** the user releases the mouse button
- **THEN** the ghost rack's final position, length (up to 4.0m), and rotation are locked, and the RightSidebar slides open in Creation mode.

### Requirement: Reusable RightSidebar container
The application SHALL extract and utilize a unified slide-out `RightSidebar` container component to host both details inspection and creation forms.

#### Scenario: Displaying sidebar panels
- **WHEN** a rack is selected OR a placement is locked
- **THEN** the reusable RightSidebar slides open from the right, hosting the respective content panel.

### Requirement: New Rack configuration form
The application SHALL display a creation form inside the RightSidebar to configure the details of the new rack.

#### Scenario: Displaying creation fields
- **WHEN** the placement is locked and creation form is shown
- **THEN** the sidebar displays a pre-populated default rack name, readonly coordinate fields, and a dropdown selection for total Units (restricted to 42U or 44U).

#### Scenario: Submitting new rack creation
- **WHEN** the user clicks "Create Rack" and validation passes
- **THEN** the system triggers `POST /api/v1/rooms/{roomId}/racks`, adds the new rack to the room's rack list, transitions back to Normal mode, and selects the new rack.
