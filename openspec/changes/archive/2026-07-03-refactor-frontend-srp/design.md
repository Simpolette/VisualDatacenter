## Context

The `frontend/src/pages/RoomDetailsPage` directory currently contains monolithic React components with multiple responsibilities. `RoomScene3D.tsx` spans over 880 lines, handling Three.js canvas setup, camera transition animation controllers, floor raycasting placement snapping, isolation dragging selection, 3D rack mesh wireframe rendering, and device faceplate mesh rendering. `RoomDetailsPage.tsx` manages room statistics calculation, workspace mode banners, toolbar buttons, and sidebar drawers.

To improve maintainability, developer readability, and component reusability, we are refactoring these monolithic components into focused single-responsibility modules under `frontend/src/components/RoomDetails` and custom hooks under `frontend/src/hooks`.

## Goals / Non-Goals

**Goals:**
- Decompose `RoomScene3D.tsx` into clean 3D sub-components (`SceneControls.tsx`, `RackMesh.tsx`, `RackDevice3D.tsx`) and hooks (`usePlacementControls.ts`, `useIsolationSelect.ts`).
- Decompose `RoomDetailsPage.tsx` into `RoomDetailsHeader.tsx` and `RoomStatsOverlay.tsx`.
- Decompose `RackSidebar2D.tsx` into `RackSlotGrid2D.tsx` and `RackTelemetryCard.tsx`.
- Place sub-components in `frontend/src/components/RoomDetails/` and hooks in `frontend/src/hooks/`.
- Ensure zero change to user-facing visual aesthetics, 3D interaction physics, or SSE telemetry behavior.
- Ensure every refactored file stays below 250 lines.

**Non-Goals:**
- Modifying Three.js lighting, materials, camera distance formulas, or 2D drawer styling.
- Changing API endpoints, store schemas, or state management logic.

## Decisions

### Decision 1: Custom Hooks for Interactive 3D Canvas Raycasting Logic
- **Choice**: Extract floor pointer handlers (`onPointerMove`, `onPointerDown`, `onPointerUp`) into `usePlacementControls.ts` (for rack placement) and `useIsolationSelect.ts` (for box selection) under `frontend/src/hooks/`.
- **Rationale**: Isolates stateful math operations (cell snapping, drag angle/length calculation, rectangle intersection filtering) from presentation components, keeping `RoomScene3D.tsx` clean and declarative.

### Decision 2: Separate 3D Scene Presentation Sub-Components
- **Choice**: Split `RackMesh` and `RackDevice3D` into dedicated `.tsx` component files under `frontend/src/components/RoomDetails/`.
- **Rationale**: Keeps 3D mesh material properties, geometry definitions, and frame-by-frame Lerp animations isolated per domain object.

### Decision 3: Modularize Toolbar and Overlay Components
- **Choice**: Extract `RoomDetailsHeader.tsx` (mode banners, reset camera, grid/label toggles, add rack button) and `RoomStatsOverlay.tsx` (floating stats badge) into `frontend/src/components/RoomDetails/`.
- **Rationale**: Decouples room layout statistics and navigation toolbar state from the main 3D canvas container.

## Risks / Trade-offs

- **[Risk] Props Drilling** → *Mitigation*: Keep prop interfaces explicit and lightweight, relying on existing Zustand stores (`useRoomStore`, `useRackStore`, `useTelemetryStore`) for shared domain state.
- **[Risk] R3F Canvas Event Context Misalignment** → *Mitigation*: Ensure `containerRef` event source binding remains attached to the `<Canvas>` wrapper in `RoomScene3D.tsx`.
