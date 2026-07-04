## 1. Extract 3D Scene Hooks & Controls

- [x] 1.1 Extract `usePlacementControls.ts` hook into `frontend/src/hooks/` for floor grid raycasting, cell snapping, and ghost rack preview state.
- [x] 1.2 Extract `useIsolationSelect.ts` hook into `frontend/src/hooks/` for selection rectangle bounds and isolated rack ID filtering.
- [x] 1.3 Extract `SceneControls.tsx` component into `frontend/src/components/RoomDetails/` for CameraControls transition animation and orbit mouse button configuration.

## 2. Extract 3D Mesh Components

- [x] 2.1 Extract `RackDevice3D.tsx` component into `frontend/src/components/RoomDetails/` for rendering 3D device faceplates, depth calculations, and alarm indicator highlights.
- [x] 2.2 Extract `RackMesh.tsx` component into `frontend/src/components/RoomDetails/` for rendering solid/X-ray rack enclosures, wireframe edges, Lerp scale/opacity animations, and html labels.

## 3. Extract Workspace UI & 2D Sidebar Components

- [x] 3.1 Extract `RoomDetailsHeader.tsx` component into `frontend/src/components/RoomDetails/` for toolbar buttons, mode banners, and scene toggles in `RoomDetailsPage.tsx`.
- [x] 3.2 Extract `RoomStatsOverlay.tsx` component into `frontend/src/components/RoomDetails/` for floating occupancy and rack count statistics overlay.
- [x] 3.3 Extract `RackSlotGrid2D.tsx` and `RackTelemetryCard.tsx` into `frontend/src/components/RoomDetails/` from `RackSidebar2D.tsx`.

## 4. Re-assemble and Verification

- [x] 4.1 Update `RoomScene3D.tsx` and `RoomDetailsPage.tsx` to compose extracted hooks and 3D sub-components.
- [x] 4.2 Run TypeScript compiler check (`npx tsc --noEmit`) to verify zero type regressions.
