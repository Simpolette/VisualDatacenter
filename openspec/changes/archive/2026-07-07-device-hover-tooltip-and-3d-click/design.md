## Context

The 3D room visualization renders selected racks as transparent X-ray cabinets with stacked `RackDevice3D` meshes inside. These device meshes are currently visual-only — no pointer events, no interactivity. Device inspection is only possible through the 2D sidebar's `RackSlotGrid2D` component, where clicking a device row sets a local `useState<DeviceSummary | null>` in `RackSidebar2D`, triggering `fetchDeviceDetails()` from the store.

Key current state:
- `RackDevice3D` already imports `useTelemetryStore` for alarm edge coloring — telemetry data access is already wired.
- `@react-three/drei` is already a dependency and provides the `Html` component for rendering DOM elements pinned to 3D positions.
- `useRackStore` already has `selectedDeviceDetails`, `fetchDeviceDetails()`, and `clearSelectedDeviceDetails()` — but no `selectedDeviceId` field to signal selection intent from arbitrary sources.
- Device selection state is local to `RackSidebar2D` and unreachable from 3D components.

## Goals / Non-Goals

**Goals:**
- Enable hover-to-preview and click-to-inspect for 3D device meshes inside selected racks
- Show live telemetry data (CPU, RAM, Temp) in the hover tooltip alongside device name, type, and status
- Provide subtle visual feedback (emissive glow) on hovered devices
- Unify device selection state so both the 3D viewport and sidebar react to the same selection

**Non-Goals:**
- No hover tooltips on unselected racks (the InstancedMesh layer) — out of scope
- No visual highlight/glow sync from sidebar hover to 3D — out of scope
- No new backend API endpoints — all required data is already available
- No changes to the `RackInstances` (InstancedMesh) component

## Decisions

### Decision 1: Promote `selectedDeviceId` to `useRackStore`

**Choice**: Add `selectedDeviceId: number | null` and `selectDevice(id: number | null)` to `useRackStore`. The sidebar's local `selectedDevice` useState is replaced by reading from the store.

**Why over alternatives**:
- *Alternative: prop-drilling a callback from `RoomDetailsPage` → `RoomScene3D` → `RackMesh` → `RackDevice3D`*: Would require touching 4+ components to thread a callback, and still needs shared readable state for the sidebar to react. Store-based is cleaner.
- *Alternative: keep local state + event emitter*: Introduces a non-React communication channel. Zustand store is the established pattern in this codebase.

**Impact**: `RackSidebar2D` replaces its local `selectedDevice` useState with `useRackStore`'s `selectedDeviceId`. The `useEffect` that calls `fetchDeviceDetails` moves its trigger from local state to store state.

### Decision 2: Use drei `<Html>` component for the tooltip overlay

**Choice**: Render an `<Html>` component from `@react-three/drei` as a child of the hovered device's mesh group, positioned above the device. The tooltip contains device name, type, status badge, and live telemetry metrics.

**Why over alternatives**:
- *Alternative: CSS overlay positioned via `project()` into screen coordinates*: Requires manual 3D→2D projection math, doesn't track camera automatically, and needs a portal outside the Canvas. `<Html>` handles all of this.
- *Alternative: 3D text labels via `<Text>`*: Can't render rich formatted content, status badges, or metric grids. HTML gives full styling control.

**Behavior**: The `<Html>` component uses `distanceFactor` for consistent sizing and `zIndexRange` to stay above other overlays. It's conditionally rendered only when the device's hover state is true.

### Decision 3: Local hover state via `useState` in `RackDevice3D`

**Choice**: Hover state (`isHovered`) is managed locally in each `RackDevice3D` component via `useState`, not in the global store.

**Why**: Hover is a transient UI concern. Putting it in the store would cause unnecessary re-renders across all subscribed components on every pointer move. Local state confines re-renders to the single hovered device.

### Decision 4: Emissive glow for hover feedback

**Choice**: On hover, increase the device mesh's `emissiveIntensity` and set `emissive` to a soft cyan/blue tint on the body materials. This provides a subtle glow without changing the device's base color or geometry.

**Why over alternatives**:
- *Alternative: outline pass via `<Edges>`*: The device already has `<Edges>` for alarm coloring. Adding a second outline layer complicates the visual hierarchy.
- *Alternative: scale up slightly*: Would conflict with the precise U-slot positioning system.

## Risks / Trade-offs

- **[Tooltip re-renders on camera movement]** → `<Html>` re-renders its DOM projection on every frame when the camera moves. Mitigated by keeping the tooltip DOM lightweight (no heavy components) and only rendering it for the single hovered device.
- **[Pointer event conflicts with orbit controls]** → `stopPropagation()` on device pointer events could interfere with camera orbit when the user intends to rotate. Mitigated by only adding click handlers to device meshes (not the outer rack group), and using `e.stopPropagation()` selectively.
- **[Store migration from local state]** → Replacing `RackSidebar2D`'s local `selectedDevice` with store-driven state changes the component's data flow. Mitigated by keeping the same `useEffect` pattern for `fetchDeviceDetails` — only the trigger source changes.
