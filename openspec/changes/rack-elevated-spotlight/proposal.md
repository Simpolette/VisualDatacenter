## Why

When inspecting a rack in dense 3D datacenter room views, adjacent 2-meter tall racks obstruct the 3D camera and clutter the operator's view. Implementing an "Elevated Spotlight" behavior ensures that selecting a rack keeps only that rack at full 3D elevation while smoothly flattening all unselected racks into low floor tiles, providing total 360-degree visibility of the active rack.

## What Changes

- **Elevated Spotlight Animation (`RackMesh.tsx`)**:
  - When a rack is selected in the 3D viewport, all unselected racks smoothly scale down (`scale.y = 0.01`) into flat floor tiles.
  - The selected rack remains at full height (`scale.y = 1.0`) with glass X-ray transparency, device chassis rendering, and PDU hardware visualization.
  - When deselected, all racks smoothly return to full 3D height (`scale.y = 1.0`).

## Capabilities

### New Capabilities
- `rack-elevated-spotlight`: Dynamic 3D elevation spotlight behavior that flattens unselected racks during single-rack inspection.

### Modified Capabilities
- None.

## Impact

- **Frontend**:
  - `src/components/RoomDetails/RackMesh.tsx`: Update `useFrame` Y-scale animation target logic.
