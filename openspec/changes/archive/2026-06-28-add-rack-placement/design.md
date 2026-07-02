## Context

Racks are displayed inside a Three.js `<Canvas>` via `RoomScene3D.tsx`. Currently, the "+ Add Rack" button in the room toolbar is a placeholder. We need a fluid, interactive workflow to position new racks on the floor grid, rotate them, and configure their specifications before saving them to the database.

## Goals / Non-Goals

**Goals:**
- Implement a workspace mode state machine in `RoomDetailsPage.tsx` (`NORMAL`, `PLACEMENT_PENDING`, `PLACEMENT_DRAGGING`, `CREATION_FORM`).
- Extract the sliding drawer container from `RackSidebar2D.tsx` into a reusable `RightSidebar.tsx` component under `frontend/src/components/Sidebar/`.
- Handle mouse events on the 3D floor plan to show a ghost rack snapping to the grid coordinates.
- Implement a click-and-drag gesture: click locks grid coordinate `(posX, posY)`, drag orients the direction (snapped to 0°, 90°, 180°, 270°), and release triggers the creation sidebar.
- Provide a form in the sidebar to configure the rack's name and select totalUnits (restricted to 42U or 44U).
- Integrate backend saving using the existing `POST /api/v1/rooms/{roomId}/racks` endpoint and dynamically update the frontend store.

**Non-Goals:**
- Supporting custom rack foot-print sizes (racks maintain standard 0.6m × 1.0m dimensions).
- Persisting placement state across page navigation.

## Decisions

### 1. Reusable RightSidebar Layout Component
Extract the sliding drawer transition wrapper, padding, close buttons, and overlay controls from `RackSidebar2D.tsx` into a reusable `RightSidebar.tsx` placed in `frontend/src/components/Sidebar/`.
*   *Rationale:* This separates visual drawer mechanics from the specific context (rack details view vs rack creation form), avoiding UI code duplication.

### 2. Disabling OrbitControls during drag placement
Temporarily disable OrbitControls (`enabled={false}`) once the user clicks down on the grid plane to start drag positioning.
*   *Rationale:* This prevents camera rotation and panning from fighting with the user's cursor drag motion while they are aiming to rotate the new rack.

### 3. Automatic Rack Naming
When the placement is locked, calculate the next available rack letter (e.g., if "Rack A" and "Rack B" exist, default to "Rack C") to pre-fill the name field in the sidebar.
*   *Rationale:* Reduces data-entry friction for users during initial room layouts.

## Risks / Trade-offs

- **Accidental Placement**: Users might accidentally click on the floor and open the sidebar when they intended to rotate the scene.
  *   *Mitigation:* Require entering "Add Rack Mode" explicitly via the toolbar button, and provide a clear, floating status banner at the top of the canvas with a "Cancel" action.
