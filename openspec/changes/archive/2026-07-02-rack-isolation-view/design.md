## Context

The Room Details page currently supports a single-rack selection model: clicking a rack highlights it, transitions the camera, and opens the 2D sidebar. There is no mechanism to visually focus on a subset of racks while suppressing the rest. In rooms with many racks, adjacent cabinets create visual clutter that makes comparing or inspecting a group of racks difficult.

The existing `workspaceMode` state machine in `RoomDetailsPage.tsx` already manages modal interaction states (`NORMAL`, `PLACEMENT_PENDING`, `PLACEMENT_DRAGGING`, `CREATION_FORM`). The isolation feature extends this pattern with two new states.

### Current Architecture
- **State**: `workspaceMode` lives in `RoomDetailsPage.tsx` as local React state
- **3D Rendering**: `RackMesh` in `RoomScene3D.tsx` renders each rack as a solid box or X-ray cabinet
- **Camera**: `SceneControls` uses `CameraControls.setLookAt()` for smooth camera transitions
- **Toolbar**: The unified toolbar in `RoomDetailsPage.tsx` already hosts Grid/Label toggles, Reset View, and Add Rack

## Goals / Non-Goals

**Goals:**
- Allow users to drag-select a rectangle on the floor plane to isolate a subset of racks
- Animate non-selected racks into flat floor footprints and elevate selected racks to full height
- Auto-transition the camera to frame the isolated group
- Integrate cleanly into the existing workspace mode state machine

**Non-Goals:**
- Persisting isolation selections to the database (purely a local viewport filter)
- Isolating individual devices within a rack
- Supporting lasso/freeform selection shapes (rectangle only for MVP)
- Modifying the 2D sidebar behavior during isolation

## Decisions

### Decision 1: Extend `workspaceMode` with two new states

**Choice**: Add `ISOLATION_SELECT` and `ISOLATION_VIEW` to the existing `workspaceMode` union type.

**Rationale**: The workspace mode state machine already gates pointer interactions, camera controls, and toolbar appearance. Adding two states keeps the pattern consistent and avoids a parallel state system. `ISOLATION_SELECT` handles the drag-selection interaction; `ISOLATION_VIEW` is the steady-state where isolated racks are elevated and the rest are flattened.

**Alternatives considered**:
- *Separate `isIsolating` boolean*: Would create ambiguous combined states (e.g., `PLACEMENT_PENDING + isIsolating`). Rejected because it complicates guards throughout the codebase.

### Decision 2: World-space floor-plane bounding box selection

**Choice**: Perform drag selection by raycasting pointer events against the floor plane mesh and computing a 2D axis-aligned bounding box in world-space XZ coordinates.

**Rationale**: The floor plane already handles pointer events for rack placement. Reusing this pattern avoids screen-to-world projection math and keeps selection logic in the same coordinate system as rack positions (`posX`, `posY`). Any rack whose center coordinate falls within `[minX..maxX, minZ..maxZ]` is selected.

**Alternatives considered**:
- *Screen-space rectangle with frustum culling*: More complex, requires camera projection matrices, and breaks if camera angle changes during drag. Rejected.
- *Individual click-to-toggle on each rack*: Less efficient for selecting groups. Could be added later as a complement.

### Decision 3: Y-scale lerp animation via `useFrame`

**Choice**: Animate rack elevation/flattening by interpolating `mesh.scale.y` and `mesh.position.y` inside the Three.js render loop using `THREE.MathUtils.lerp`.

**Rationale**: Scaling the Y axis of an existing box geometry is GPU-free (no geometry recreation), runs at display framerate, and produces a smooth physical "growing/shrinking" effect. A lerp factor of `delta * 8` gives responsive but non-jarring motion (~125ms to settle).

**Alternatives considered**:
- *CSS/spring animation library (react-spring)*: Adds a dependency and doesn't integrate naturally with Three.js render loop. Rejected.
- *Instant snap (no animation)*: Functional but visually jarring. Rejected for UX quality.

### Decision 4: Camera framing uses group centroid and spread

**Choice**: Compute the centroid and spatial spread of isolated racks, then position the camera at a distance proportional to the spread using the average rotation angle of the group.

**Rationale**: This generalizes the existing single-rack camera transition logic in `SceneControls`. For a single isolated rack, it produces nearly identical behavior to the current selection camera. For multiple racks, it naturally zooms out to fit the group.

### Decision 5: Local state for isolation rack IDs

**Choice**: Store `isolatedRackIds: number[]` as local state in `RoomDetailsPage.tsx` alongside the existing `workspaceMode`.

**Rationale**: Isolation is a transient viewport filter, not domain state. It doesn't need to persist across page navigations or be shared with other components via Zustand. Keeping it local matches how `selectedRackId` and `newRackCoords` are managed.

## Risks / Trade-offs

- **Many racks in selection**: If a user selects 20+ racks, the camera framing may be too zoomed out to see individual detail. → *Mitigation*: Allow clicking an individual elevated rack to enter the normal single-rack selection/sidebar flow from within isolation view.

- **Drag conflicts with orbit controls**: In `ISOLATION_SELECT`, pointer drag on the floor must draw a selection box, not rotate the camera. → *Mitigation*: Disable orbit controls when entering `ISOLATION_SELECT` (same pattern used for `PLACEMENT_DRAGGING`).

- **Rack placement mode conflict**: User cannot be in both isolation and rack placement mode simultaneously. → *Mitigation*: The workspace mode union type enforces mutual exclusion by design.

- **Performance with useFrame lerp**: Every rack runs a lerp calculation every frame during transitions. → *Mitigation*: The lerp converges quickly (~8 frames) and the calculations are trivial scalar math. No measurable impact for rooms with <100 racks.
