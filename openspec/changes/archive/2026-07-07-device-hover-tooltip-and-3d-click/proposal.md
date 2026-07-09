## Why

Devices inside a selected rack's 3D X-ray view are currently non-interactive visual-only meshes. The only way to inspect a device is through the 2D sidebar's U-slot grid — clicking a device row to open its detail panel. This creates a disconnect between the rich 3D visualization and the actual device interaction workflow. Users looking directly at a device in 3D should be able to hover for quick-glance info (name, type, status, live telemetry) and click to open its full detail view in the sidebar, matching the mental model of "point at what you see."

## What Changes

- **3D device hover tooltip**: Hovering over a device mesh inside a selected rack's X-ray view displays a floating HTML overlay showing the device's name, type name, status, and live telemetry metrics (CPU, RAM, Temperature) streamed from the telemetry store.
- **3D device hover glow**: Hovered device meshes receive a subtle emissive glow effect to provide visual feedback that the device is interactive.
- **3D device click-to-inspect**: Clicking a device mesh inside the selected rack triggers the same device detail view that clicking a device row in the sidebar's `RackSlotGrid2D` currently opens — the sidebar navigates to the device's detail panel showing telemetry, module bays, and physical components.
- **Shared device selection state**: The currently local `selectedDevice` state in `RackSidebar2D` is promoted to the global `useRackStore` so that both the 3D viewport and the sidebar can read and write device selection consistently.

## Capabilities

### New Capabilities
- `device-3d-interaction`: Hover tooltip overlay and click-to-inspect behavior for 3D device meshes inside selected rack X-ray views, including shared device selection state between the 3D viewport and sidebar.

### Modified Capabilities
- `room-details-page`: Adding pointer event handlers and hover/glow visual feedback to the existing `RackDevice3D` component within the selected rack's 3D X-ray visualization.

## Impact

- **Frontend components affected**:
  - `RackDevice3D.tsx` — add `onPointerOver`, `onPointerOut`, `onClick` handlers; add emissive glow on hover; render `<Html>` tooltip overlay from `@react-three/drei`
  - `useRackStore.ts` — add `selectedDeviceId` and `selectDevice` action to global store
  - `RackSidebar2D.tsx` — replace local `selectedDevice` useState with store-driven `selectedDeviceId`; react to selections originating from either 3D clicks or sidebar clicks
  - `RackMesh.tsx` — pass device selection callback through to `RackDevice3D` children
- **Dependencies**: No new dependencies — `@react-three/drei`'s `Html` component is already available; `useTelemetryStore` is already imported in `RackDevice3D`
- **Backend**: No backend changes required — all data (device summary, telemetry metrics) is already served by existing APIs
- **No breaking changes**
