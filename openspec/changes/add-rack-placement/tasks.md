## 1. Refactoring & Reusable Sidebar Extraction

- [ ] 1.1 Extract the CSS/HTML sliding layout, backdrop overlay, and escape key listener from `RackSidebar2D.tsx` into a reusable `RightSidebar.tsx` component in `frontend/src/components/Sidebar/RightSidebar.tsx`.
- [ ] 1.2 Update `RackSidebar2D.tsx` to import and utilize the newly created `RightSidebar` wrapper.

## 2. 3D Viewport Placement Interaction

- [ ] 2.1 Define the `workspaceMode` union state (`NORMAL` | `PLACEMENT_PENDING` | `PLACEMENT_DRAGGING` | `CREATION_FORM`) in `RoomDetailsPage.tsx` and propagate it to the 3D scene.
- [ ] 2.2 Implement a dedicated floor overlay mesh in `RoomScene3D.tsx` that intercepts raycast events during placement mode.
- [ ] 2.3 Add rendering of a semi-transparent, orange ghost rack that snaps to the nearest 1.0m grid cell coordinates based on hover pointer moves.
- [ ] 2.4 Implement click-and-drag listener to lock position on pointer-down, calculate 90-degree snapped rotation based on drag vector, and disable OrbitControls during drag.
- [ ] 2.5 Lock final position/rotation coordinates and open the creation form sidebar on pointer-up.

## 3. Configuration Form & Backend API Integration

- [ ] 3.1 Create the `CreateRackSidebar2D.tsx` component to host the creation form inside the reusable `RightSidebar` container.
- [ ] 3.2 Implement auto-naming helper to find the next alphabetical letter (e.g. "Rack C") to pre-fill the name field.
- [ ] 3.3 Add create rack API request function (`POST /api/v1/rooms/{roomId}/racks`) inside the Zustand store (`useRackStore.ts`).
- [ ] 3.4 Bind form submission to invoke the store action, validate that totalUnits is either 42 or 44, append the new rack, and return the workspace mode to Normal.
- [ ] 3.5 Bind cancel buttons in both the top banner and sidebar to restore Normal mode and clear ghost states.
