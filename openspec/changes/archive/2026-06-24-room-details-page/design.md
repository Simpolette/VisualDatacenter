## Context

The system currently allows users to list rooms, but has no details view. We need to implement a visualization of a room's physical layout. Racks inside the room are positioned at coordinate offsets, and each rack houses multiple server or network devices. This design outlines how we will render the 3D room floor plan using Three.js / React Three Fiber, manage the page routing and state, animate the camera to focus orthogonally on clicked racks, and slide out a 2D U-slot sidebar panel for inspecting rack devices.

## Goals / Non-Goals

**Goals:**
- Provide a responsive details view for a room at `/rooms/:id`.
- Update navigation from `RoomCard` on the Room List page to navigate to the Details page.
- Render the room floor plan in 3D: a floor plane of size `widthM` by `depthM` containing boxes representing racks positioned at `posX` and `posY`.
- Render rack colors dynamically based on utilization: red for >=80% utilization, yellow for 50%-80% utilization, and green for <50% utilization.
- Enable user interaction (clicking a rack mesh triggers a smooth camera orbit and zoom animation to face it orthogonally, disables manual rotation controls, and opens the 2D details sidebar).
- Render a 2D slide-out sidebar showing a grid representation of the rack U-slots (numbered 1 to 42 or 44 from bottom to top), mapping devices over their correct slots based on `startU` and `deviceType.heightU`.
- Install necessary dependencies (`three`, `@react-three/fiber`, `@react-three/drei`, and `lucide-react`) ensuring compatibility with React 19.

**Non-Goals:**
- Allowing users to add, remove, or edit rack coordinates within the 3D scene (read-only visualization for this scope).
- Allowing users to manage, add, or delete devices inside the 2D rack sidebar (read-only slot visualization for this scope).
- Displaying PDUs or other physical attributes in the 3D scene.

## Decisions

### Decision 1: React 19 Compatible R3F & Drei Packages
- **Choice**: Add `three`, `@types/three`, `@react-three/fiber`, and `@react-three/drei` using compatible versions for React 19, installing with `--legacy-peer-deps` if npm peer checks block the installation.
- **Rationale**: React 19 is used by the frontend. Standard `@react-three/fiber` v8/v9 and `@react-three/drei` have peer dependencies on React 18. Using the `--legacy-peer-deps` flag allows installation of stable packages that work under React 19's runtime without failing the installation.

### Decision 2: 3D Positioning and Origin Mapping
- **Choice**: Offset rack positions by `(-room.widthM / 2, -room.depthM / 2)` relative to the 3D scene's origin.
- **Rationale**: Three.js `PlaneGeometry` places the plane's center at origin `(0,0,0)`. However, the room layout coordinate system in the database expects `posX=0` and `posY=0` to correspond to the bottom-left corner of the room. To align them, we must shift the position of each rack mesh relative to the floor plane's center: `meshX = rack.posX - room.widthM / 2` and `meshZ = rack.posY - room.depthM / 2` (mapping Y to 3D depth axis Z).

### Decision 3: Client State Management (Zustand Stores)
- **Choice**: Create a new `useRackStore` Zustand store in `frontend/src/stores/useRackStore.ts`.
- **Rationale**: The new store will manage fetching racks for a room (`GET /api/v1/rooms/:roomId/racks`) and fetching detail view of a rack (`GET /api/v1/racks/:id`), keeping page level React components thin and clean.

### Decision 4: Programmatic Camera Animation and Controls
- **Choice**: Use `@react-three/drei`'s `<CameraControls>` instead of standard `OrbitControls`. When a rack is clicked, disable manual OrbitControls, calculate the front face normal vector based on `posX`, `posY` and `rotationDeg`, and call `cameraControls.setLookAt(...)` to glide the camera to face the rack orthogonally. Re-enable manual controls on close.
- **Rationale**: `<CameraControls>` supports out-of-the-box transitions and target transitions, removing manual tick loops or GSAP. Freezing manual controls when focused prevents accidental camera misalignments while editing/inspecting.

### Decision 5: 2D Slide-out Sidebar Layout
- **Choice**: Absolutely positioned sliding panel (drawer) on the right side of the viewport, layered on top of the 3D canvas.
- **Rationale**: A slide-out panel leaves the centered 3D focused rack visible to the left, maintaining spatial context of the room environment while editing, which is superior to a modal popup that blocks the entire scene.

## Risks / Trade-offs

- **[Risk 1] React 19 Library Warnings**: R3F or Drei might emit warnings due to React 19 strict mode or React 19 hook changes.
  - *Mitigation*: Ensure the canvas component is mounted clean, suppress console warnings if they do not cause runtime failures, and verify the page runs correctly.
- **[Risk 2] Room Coordinates Overflow**: Racks might have coordinates outside the room boundaries if data is invalid.
  - *Mitigation*: The 3D floor plan will still render them outside the floor plane. We do not clip them in 3D so users can see misalignment.
- **[Risk 3] Camera Obstruction**: Large racks in front of the selected rack might block the camera's focused view.
  - *Mitigation*: Position the camera close enough to the target rack to clip out objects behind the camera, or animate the opacity of blocking racks. (Out of scope for initial MVP, but target distance of 3-5m typically suffices).
