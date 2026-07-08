## 1. Shared Device Selection State

- [x] 1.1 Add `selectedDeviceId: number | null` and `selectDevice(id: number | null)` action to `useRackStore`. Update `clearSelectedRack` to also clear `selectedDeviceId`. Ensure `selectDevice` triggers `fetchDeviceDetails` when id is non-null and `clearSelectedDeviceDetails` when null.
- [x] 1.2 Refactor `RackSidebar2D` to replace local `selectedDevice` useState with store-driven `selectedDeviceId`. Remove the local state and its `useEffect`, instead reading `selectedDeviceId` from the store and finding the matching `DeviceSummary` from `rack.devices`. Update the `RackSlotGrid2D` `onSelectDevice` callback to call `store.selectDevice(device.id)`.

## 2. 3D Device Hover Glow

- [x] 2.1 Add `onPointerOver` and `onPointerOut` handlers to the primary device `<mesh>` in `RackDevice3D`. Introduce local `useState<boolean>` for `isHovered`. Set `document.body.style.cursor` to `pointer` on hover and `auto` on leave.
- [x] 2.2 Apply subtle emissive glow to device body materials when `isHovered` is true: increase `emissiveIntensity` and set a soft cyan/blue `emissive` tint on `material-0` through `material-3`. Restore default emissive values on hover leave.

## 3. 3D Device Hover Tooltip

- [x] 3.1 Create a `DeviceTooltip3D` component that renders a `<Html>` overlay from `@react-three/drei`. The component accepts `device: Device3DItem` and renders: device name, device type name (derived from props or context), status badge (ACTIVE/MAINTENANCE/OFFLINE with color-coded indicator), and a telemetry metrics grid.
- [x] 3.2 Wire `DeviceTooltip3D` to `useTelemetryStore` to display live CPU, RAM, and Temperature metrics with their units. Show a "No telemetry data" placeholder when no metrics exist for the device. Style the tooltip with a dark glassmorphic card matching the existing sidebar aesthetic.
- [x] 3.3 Conditionally render `<DeviceTooltip3D>` inside `RackDevice3D` when `isHovered` is true, positioned above the device mesh. Use `distanceFactor` for consistent sizing and `pointerEvents="none"` to prevent the tooltip from capturing mouse events.

## 4. 3D Device Click-to-Inspect

- [x] 4.1 Add `onClick` handler to the primary device `<mesh>` in `RackDevice3D`. The handler calls `e.stopPropagation()` and invokes `store.selectDevice(device.id)` from `useRackStore`.
- [x] 4.2 Pass `onSelectDevice` callback through `RackMesh` to `RackDevice3D` as an alternative integration path, or confirm that `RackDevice3D` can directly access the store (it already imports `useTelemetryStore`, so direct store access is the established pattern).

## 5. Integration Testing and Polish

- [x] 5.1 Verify end-to-end flow: hover device in 3D → tooltip appears with telemetry → click device → sidebar navigates to device detail view → click "Back to Rack" → `selectedDeviceId` clears → tooltip works again on re-hover.
- [x] 5.2 Verify sidebar-initiated flow still works: click device in `RackSlotGrid2D` → sidebar shows device detail → back button clears selection. Confirm no regressions from the state migration.
- [x] 5.3 Verify edge cases: deselecting the rack clears device selection, switching to a different rack clears previous device selection, tooltip disappears when rack is deselected.
