## Why

The current React 3D room visualization and rack management components (particularly `RoomScene3D.tsx`, `RoomDetailsPage.tsx`, and `RackSidebar2D.tsx`) have grown into monolithic files containing multiple mixed responsibilities: camera transition controls, raycasting placement drag state, isolation drag box selection, 3D mesh rendering, 2D slot layout rendering, and toolbar UI logic. This violates the Single Responsibility Principle (SRP), making component maintenance, testing, and 3D scene optimization difficult.

## What Changes

- **Decompose `RoomScene3D.tsx`**: Split the 880+ line monolithic 3D scene file into focused, single-responsibility components and custom hooks:
  - `SceneControls.tsx`: Camera positioning, transition animations, and orbit mouse configurations.
  - `RackMesh.tsx`: 3D solid and X-ray translucent rack rendering, wireframes, and label overlays.
  - `RackDevice3D.tsx`: 3D device faceplate positioning and alarm highlights inside rack enclosures.
  - `usePlacementControls.ts`: Custom hook managing floor grid raycasting, snapping, ghost preview, and drag vector calculations.
  - `useIsolationSelect.ts`: Custom hook managing box selection rectangle and isolated rack filtering.
- **Decompose `RoomDetailsPage.tsx`**:
  - `RoomDetailsHeader.tsx`: Navigation header, mode alert banners, reset camera, grid/label toggles, and add rack buttons.
  - `RoomStatsOverlay.tsx`: Floating statistics overlay (total racks, U space occupancy percentage).
- **Decompose `RackSidebar2D.tsx`**:
  - `RackSlotGrid2D.tsx`: 2D interactive rack unit (U1-U44) slot grid rendering.
  - `RackTelemetryCard.tsx`: Real-time telemetry metric badges and alarm acknowledgement UI.

## Capabilities

### New Capabilities
- `frontend-srp-refactoring`: Architectural decomposition of monolithic frontend page components into specialized React 3D/2D sub-components and custom hooks following SRP.

### Modified Capabilities
*(None - functional capabilities, 3D interaction behaviors, and telemetry streams remain identical)*

## Impact

- **Frontend Codebase**: Reorganizes `frontend/src/pages/RoomDetailsPage/` and creates subdirectories `components/` and `hooks/`.
- **Maintainability & Readability**: Dramatically reduces component line counts (no single file over 250 lines), decouples state management from 3D canvas rendering, and improves testability without affecting UI/UX functionality.
