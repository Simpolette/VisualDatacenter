# room-details-page Specification

## Purpose
TBD - created by archiving change room-details-page. Update Purpose after archive.
## Requirements
### Requirement: Room details layout and navigation
The application SHALL render a details page for a room when the user navigates to `/rooms/:id`. The page SHALL integrate the room's name, floor location, and physical dimensions directly into a unified top toolbar. It SHALL display aggregate statistics (total racks and overall occupancy rate) as a floating overlay pill within the 3D viewport, removing any separate standalone page header.

#### Scenario: Navigating to room details page
- **WHEN** the user navigates to `/rooms/1`
- **THEN** the application fetches the room with ID 1, displays its metadata inside the integrated top toolbar, overlays the total racks and occupancy statistics inside the 3D viewport, and removes the standalone page header.

### Requirement: 3D floor plan visualization
The Room Details page SHALL render a 3D floor plan representing the room's dimensions and the positions of all racks in the room.

#### Scenario: Rendering the 3D scene
- **WHEN** the Room Details page loads successfully
- **THEN** the application renders a 3D canvas with a floor plane scaled to widthM and lengthM, and fetches and renders all room racks at their posX and posY coordinates

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
- **THEN** the rack mesh color changes to Blender orange (`#e67e22`), the edge outline turns bright gold (`#ffae19`), and the text label changes to an orange-themed style.

### Requirement: Room floor grid helper
The application SHALL render a room floor helper to facilitate spacing and layout reference. The grid and floor coordinates SHALL align perfectly with room boundaries using the bottom-left corner of the room floor as the origin (0, 0, 0) in world space, preventing fractional or half-tiles on odd dimensions.

#### Scenario: Grid visibility is enabled
- **WHEN** the grid helper is enabled
- **THEN** the system renders a simplified, single-level grid of $1.0\text{m} \times 1.0\text{m}$ cells aligned exactly with the floor borders.

### Requirement: Rack selection triggers camera transition
Clicking a rack mesh in the 3D scene SHALL set the selected rack, animate the camera to focus straight on the rack's front face, open the 2D rack editor sidebar, and allow mouse-driven orbit rotation around the selected rack while locking the look-at target to the rack center.

#### Scenario: Clicking a rack triggers transition
- **WHEN** the user clicks a rack mesh in the 3D canvas
- **THEN** the system sets selectedRackId, smoothly transitions the camera to center on the rack facing it flatly, slides open the 2D rack editor sidebar, and enables left-click mouse orbiting while disabling panning.

### Requirement: Rack Manager 2D sidebar panel
The application SHALL display a 2D slide-out sidebar for the selected rack, showing its U-slot utilization and installed devices. The sidebar SHALL include an "Add Device" action button in the header area and per-device delete actions on each device card in the U-slot grid.

#### Scenario: Sidebar displays U-slots and devices
- **WHEN** selectedRackId is not null
- **THEN** the sidebar fetches rack details from `GET /api/v1/racks/:id` and displays a vertical grid of U-slots (1 to totalUnits) from bottom to top, with installed devices highlighted across their occupied slots (startU to startU + heightU - 1)

#### Scenario: Sidebar displays Add Device button
- **WHEN** the Rack Inspector sidebar is open with rack details loaded
- **THEN** the sidebar header area includes an "Add Device" button that toggles the Install Device form

#### Scenario: Sidebar displays device delete actions
- **WHEN** the sidebar displays installed device cards in the U-slot grid
- **THEN** each device card includes a hover-revealed trash icon button for deletion

#### Scenario: Closing the sidebar
- **WHEN** the user clicks the close button in the sidebar or presses Esc
- **THEN** selectedRackId is set back to null, the sidebar slides shut, any open install form is collapsed, and manual camera OrbitControls are re-enabled

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

### Requirement: Realistic 2D rack device faceplate rendering
The Rack Manager 2D sidebar panel SHALL render realistic equipment faceplates for each device in the U-slot grid:
- If a front bezel image is available on the backend via the device type's `imagePath`, the sidebar card SHALL render only the faceplate image filling the card slot without any overlapping text or status labels.
- If no image is available, the sidebar card SHALL render a simulated CSS chassis faceplate, including vertical rack ear bars with mounting screw details in the corners, horizontal ventilation slots scaling with the device's U-height, category icon, device names, and a glowing status LED indicator representing the device status (`ACTIVE` -> pulsing green, `MAINTENANCE` -> pulsing amber, `OFFLINE` -> pulsing red).

#### Scenario: Rendering device card with bezel image
- **WHEN** the 2D sidebar grid renders a device that has a valid front-panel image path
- **THEN** the device card displays only the backend-served bezel image as its faceplate filling the card slot without overlapping text details.

#### Scenario: Rendering device card with fallback CSS faceplate
- **WHEN** the 2D sidebar grid renders a device that does not have a front-panel image
- **THEN** the device card renders a slate-gradient bezel background with metallic ear plates, screw details, ventilation slots, device name/type text, and a pulsing status LED matching the device status.

### Requirement: Selected rack 3D X-Ray visualization and device stack
When a rack is selected in the 3D viewport, the system SHALL visualize the rack as a transparent open-frame cabinet containing stacked 3D device meshes:
- The outer enclosure of the selected rack SHALL render as an open-frame translucent glass mesh (`opacity: 0.15`) with open front (+Z) and rear (-Z) faces to provide an unobstructed view of equipment.
- The cabinet frame SHALL render 4 vertical black metal corner posts.
- Each device installed in the rack SHALL render as a distinct 3D box mesh situated inside the rack frame.
- The height of each device mesh SHALL match its `heightU` dimension scaled to the rack's unit height.
- The width of each device mesh SHALL match its `widthMm` scaled to meters, with a fallback to standard 19-inch mounting width (0.4826m).
- The length of each device mesh SHALL match its `lengthMm` scaled to meters.
- The front face of each device mesh SHALL be textured with the device type's front-panel bezel image loaded via `@react-three/drei`'s `useTexture` hook (or a fallback dark slate faceplate if no image is available).
- The faceplate texture and length positioning of each device mesh SHALL align with the front of the rack if mounted `FRONT` (case-insensitive default), and align with the back of the rack if mounted `REAR`.
- Internal 3D device meshes SHALL only render once detailed backend rack information (`isDetailsLoaded`) is loaded, preventing visual size flashing from fallback dimensions.
- When a rack is unselected, the system SHALL cleanly transition back to its solid utilization clay box using distinct element keys (`rack-solid-{id}` and `rack-xray-{id}`) to prevent multi-material state reconciliation leaks.
- **Each device mesh SHALL respond to pointer events: `onPointerOver` to display a hover tooltip and emissive glow, `onPointerOut` to clear hover state, and `onClick` to set the global `selectedDeviceId` in `useRackStore`.**

#### Scenario: Selected rack cabinet mesh changes to translucent frame
- **WHEN** the user selects a rack in the 3D viewport
- **THEN** the rack mesh transitions from a solid color-blocked clay box to a translucent glass cabinet enclosure with 4 metallic corner post meshes.

#### Scenario: Deferred device mesh mounting prevents dimension flash
- **WHEN** the user selects a rack in the 3D viewport and detailed rack details are fetching over the network
- **THEN** the 3D canvas opens the open-frame cabinet shell and defers rendering individual 3D device chassis meshes until `isDetailsLoaded` is true, ensuring devices appear cleanly with their exact physical dimensions.

#### Scenario: Unselecting a rack restores solid clay box
- **WHEN** the user unselects a currently selected rack
- **THEN** the system tears down the open-frame X-ray mesh and reinstantiates a clean solid clay box mesh with fully opaque faces matching the rack's capacity color.

#### Scenario: Individual devices render inside selected rack mesh with physical sizes
- **WHEN** the 3D viewport renders the devices of a selected rack
- **THEN** each device renders as a separate box mesh centered on its occupied U-slots, with its height proportional to its `heightU`, its width matching its `widthMm` value (fallback to 0.4826m), and its length matching its `lengthMm` value.

#### Scenario: Device mesh faceplate texture matches mount orientation
- **WHEN** a device mesh is rendered in the stack
- **THEN** if the device is `FRONT` mounted, its front-panel bezel texture loaded via `useTexture` is mapped to the positive Z face of its geometry and its length aligns with the front of the rack; if the device is `REAR` mounted, its front-panel bezel texture is mapped to the negative Z face of its geometry and its length aligns with the back of the rack.

#### Scenario: Device meshes respond to pointer events
- **WHEN** a device mesh is rendered inside a selected rack's X-ray view
- **THEN** the device mesh SHALL have `onPointerOver`, `onPointerOut`, and `onClick` handlers that trigger hover tooltip display, hover glow effects, and device selection via the global store respectively.

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

