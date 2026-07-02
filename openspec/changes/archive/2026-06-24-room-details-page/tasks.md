## 1. Setup & Dependencies

- [x] 1.1 Install frontend dependencies `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, and `lucide-react` using `--legacy-peer-deps` to ensure React 19 compatibility
- [x] 1.2 Verify that `package.json` updates successfully and the dev server starts and compiles without errors

## 2. Routing & Store Implementation

- [x] 2.1 Add `/rooms/:id` route in `frontend/src/App.tsx` mapping to `RoomDetailsPage`
- [x] 2.2 Update `RoomCard.tsx` to link to `/rooms/:id` using `Link` from `react-router-dom` or programmatic navigation
- [x] 2.3 Create `useRackStore.ts` store in `frontend/src/stores/` supporting fetching racks in a room (`GET /api/v1/rooms/:roomId/racks`) and individual rack details with devices (`GET /api/v1/racks/:id`)

## 3. 3D Scene Components

- [x] 3.1 Create `RoomScene3D.tsx` component under `frontend/src/pages/RoomDetailsPage/` with a standard full-viewport `<Canvas>` container and `@react-three/drei`'s `<CameraControls>` (instead of standard `OrbitControls`)
- [x] 3.2 Implement `Floor` mesh component scaled to the room's `widthM` and `depthM`
- [x] 3.3 Implement `RackMesh` component mapping `posX` and `posY` relative to the offset center, displaying boxes and coloring them red if occupancy >= 80%, yellow if occupancy is between 50% and 80%, and green if occupancy < 50%
- [x] 3.4 Hook up `onClick` on `RackMesh` to update the parent component's `selectedRackId` state
- [x] 3.5 Implement camera transition logic inside `RoomScene3D` that listens to `selectedRack` changes, temporarily disables manual rotation/pan, and triggers `cameraControls.setLookAt(...)` to glide the camera to face the selected rack orthogonally (re-enabling manual controls when deselected)

## 4. 2D Rack Manager Slide-out Sidebar

- [x] 4.1 Create `RackSidebar2D.tsx` component positioned absolutely as a right-side sliding drawer panel
- [x] 4.2 Fetch selected rack details when `selectedRackId` is active, display a header showing rack name and utilization stats
- [x] 4.3 Implement a vertical grid representing U-slots numbered 1 to `totalUnits` (42 or 44) from bottom to top
- [x] 4.4 Render device blocks overlapping the correct slots based on `startU` and `deviceType.heightU`
- [x] 4.5 Add a Close button resetting `selectedRackId` to null, sliding the panel shut

## 5. Main Details Page Integration

- [x] 5.1 Create `RoomDetailsPage.tsx` container linking room fetch, rack fetch, layout sizing, and sidebar panel transitions together
- [x] 5.2 Add back-navigation button in header to return to `/rooms` list
- [x] 5.3 Verify layout responsiveness and clean styling using Tailwind CSS v4 design tokens
- [x] 5.4 Test end-to-end user navigation: listing rooms -> clicking a card -> rotating 3D view -> selecting rack -> camera glides to face rack orthogonally -> sidebar slides open with devices -> closing sidebar -> camera releases manual controls

