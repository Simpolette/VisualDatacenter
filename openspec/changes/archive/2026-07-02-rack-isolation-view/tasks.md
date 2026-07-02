## 1. State Machine and Toolbar Extension

- [x] 1.1 Extend the `workspaceMode` union type in `RoomDetailsPage.tsx` to include `ISOLATION_SELECT` and `ISOLATION_VIEW`, and add `isolatedRackIds: number[]` local state with its setter
- [x] 1.2 Add the "Isolate" toggle button (using `Focus` or `Scan` icon from lucide-react) to the unified workspace toolbar in `RoomDetailsPage.tsx`, wired to enter `ISOLATION_SELECT` on click from `NORMAL` and return to `NORMAL` on click from `ISOLATION_SELECT` or `ISOLATION_VIEW`
- [x] 1.3 Add a dedicated toolbar banner strip (matching the existing orange "Add Rack Mode" banner pattern) that displays when `workspaceMode` is `ISOLATION_SELECT`, showing instructions ("Click and drag on the floor to select racks") and a Cancel button

## 2. Rack Flattening Animation

- [x] 2.1 Pass `workspaceMode` and `isolatedRackIds` as props from `RoomDetailsPage.tsx` through `RoomScene3D.tsx` to each `RackMesh` component
- [x] 2.2 Add a `useFrame` lerp loop inside `RackMesh` to smoothly interpolate `mesh.scale.y` and `mesh.position.y` between full-height (`1.0`, `RACK_HEIGHT/2`) and flat-footprint (`0.01`, `0.005`) targets based on the current workspace mode and isolation membership
- [x] 2.3 Interpolate mesh material opacity between `0.85` (normal) and `0.15` (flattened footprint) in the same `useFrame` loop to make non-selected rack outlines subtle

## 3. Drag-to-Select Bounding Box

- [x] 3.1 Add `isolationDragStart` and `isolationDragCurrent` local state in `RoomScene3D.tsx` to track the world-space XZ coordinates of the pointer-down and pointer-move positions during `ISOLATION_SELECT` mode
- [x] 3.2 Wire `onPointerDown`, `onPointerMove`, and `onPointerUp` handlers on the floor plane mesh to capture and update the drag coordinates when `workspaceMode === 'ISOLATION_SELECT'`
- [x] 3.3 Render a semi-transparent selection rectangle mesh on the floor plane (`y=0.03`) spanning the axis-aligned bounding box from `isolationDragStart` to `isolationDragCurrent`, colored sky-blue (`#38bdf8`, opacity `0.2`) with a brighter wireframe border
- [x] 3.4 On `onPointerUp`, compute which racks have their `(posX, posY)` within the selection bounds, store matching IDs in `isolatedRackIds`, and transition to `ISOLATION_VIEW` if at least one rack is selected (otherwise stay in `ISOLATION_SELECT`)

## 4. Rack Elevation and Isolation View

- [x] 4.1 Update the `useFrame` lerp targets in `RackMesh` so that in `ISOLATION_VIEW` mode, racks in `isolatedRackIds` animate to full height while all others remain flat footprints
- [x] 4.2 Allow clicking an elevated isolated rack in `ISOLATION_VIEW` mode to set `selectedRackId` and open the 2D Rack Inspector sidebar while keeping the isolation state active for the remaining racks

## 5. Camera Auto-Framing

- [x] 5.1 Update `SceneControls` to accept `isolatedRackIds` and the full `racks` array as props, and add an effect that triggers when `workspaceMode` transitions to `ISOLATION_VIEW`
- [x] 5.2 Compute the centroid (`avgX`, `avgZ`) and spatial spread of the isolated racks, then call `controlsRef.current.setLookAt()` to smoothly position the camera at a distance proportional to `Math.max(spread * 1.5, 3.2)`, elevated above center height, looking at the group centroid
- [x] 5.3 When exiting isolation mode back to `NORMAL`, reset the camera to the default room overview position (reuse the existing reset logic)
