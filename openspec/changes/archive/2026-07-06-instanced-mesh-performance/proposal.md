## Why

The 3D room visualization drops below interactive frame rates (~15-20 FPS) at approximately 300 racks. The project's non-functional requirement mandates **FPS > 40 with 10,000+ devices** across ~400 racks. The root cause is that every rack is a standalone React component (`RackMesh`) with its own `useFrame` callback, Zustand subscriptions, geometry/material allocations, shadow passes, and DOM-based label — resulting in ~1,600+ GPU draw calls and 400+ per-frame JavaScript callbacks at room scale.

## What Changes

- **Replace per-rack React components with Three.js `InstancedMesh`** for all unselected racks, collapsing ~800 draw calls into 1-2 draw calls
- **Disable shadow casting/receiving** on rack meshes and the directional light shadow map, eliminating ~800 shadow-pass draw calls
- **Consolidate 400 `useFrame` callbacks into a single batched loop** that updates instance matrices (for isolation/elevation animation) and instance colors (for utilization, search, hover)
- **Replace `<Html>` DOM labels** with GPU-rendered `<Text>` from drei or distance-culled sprites, eliminating 400+ real DOM nodes from the scene
- **Retain the detailed `<RackMesh>` component only for the selected rack** (x-ray view, corner pillars, devices, PDUs, edges) — at most 1 at a time
- **Implement hover/click detection via `InstancedMesh` raycasting** using `event.instanceId` instead of per-component pointer event handlers

## Capabilities

### New Capabilities
- `instanced-rack-rendering`: GPU-instanced rendering of all unselected rack meshes using Three.js `InstancedMesh` with per-instance color and transform buffers, hover detection via instanceId raycasting, and batched animation updates
- `scene-performance-tuning`: Shadow removal, label rendering optimization (DOM to GPU text), and draw call reduction to meet the >40 FPS target at 400 racks / 10,000 devices

### Modified Capabilities
- `room-details-page`: The 3D rack rendering pipeline changes from per-rack React components to instanced rendering. All existing visual behaviors (utilization coloring, search highlighting, isolation flatten/elevate, hover, click selection, camera transitions) must be preserved with identical user-facing behavior.

## Impact

- **Frontend 3D components**: `RoomScene3D.tsx`, `RackMesh.tsx` undergo major refactoring. `RackMesh` splits into an instanced bulk renderer and a detail-only selected-rack component
- **No backend changes**: The API surface, data model, and rack/device DTOs remain unchanged
- **No spec-level behavior changes for end users**: All interactions (click, hover, search highlight, isolation, labels, camera transitions) remain functionally identical
- **Dependencies**: No new npm packages required — `InstancedMesh` is core Three.js, `Text` is already available in `@react-three/drei`
- **Risk**: The refactor touches the central rendering loop; thorough visual regression testing is needed to ensure utilization colors, isolation animation, and search highlighting behave identically
