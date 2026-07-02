## Context

Currently, in `RoomScene3D.tsx`, when a rack is selected (`selectedRack` is non-null), camera interaction controls (`mouseConfig`) are set to:
`{ left: 0, middle: 0, right: 0, wheel: 16 }`
This disables all mouse drag operations (orbit rotation and panning), leaving only scroll wheel zooming active. While this locks the view to a face-on perspective matching the 2D sidebar, it prevents users from inspecting the rear face or sides of the selected rack.

## Goals / Non-Goals

**Goals:**
- Allow left-click mouse dragging to orbit around the selected rack in 3D space.
- Preserve target focus on the selected rack's center point so the camera rotates smoothly around the rack rather than panning into empty space.
- Maintain scroll-wheel zooming while disabling right-click / middle-click panning when a rack is selected.

**Non-Goals:**
- Changing camera behavior in non-selection modes (Normal, Placement Dragging, Isolation Selection).
- Adding automatic continuous camera rotation or autorotate presets.

## Decisions

### 1. Camera Control Configuration during Rack Selection
* **Decision**: Update `mouseConfig` in `SceneControls` within `RoomScene3D.tsx`:
  - When `selectedRack` is active: set `{ left: 1, middle: 0, right: 0, wheel: 16 }`.
  - Action `1` maps left-click drag to orbit rotation.
  - Action `0` disables right-click and middle-click panning.
  - Action `16` keeps scroll-wheel zooming active.
* **Rationale**: This allows full 360-degree orbit inspection of front and rear equipment faces while locking the pivot point at the rack's centroid, preventing accidental camera displacement away from the target rack.

## Risks / Trade-offs

- **[Risk] User orbiting to non-standard angles** $\rightarrow$ *Mitigation*: The initial transition still animates straight to the front face. If desired, clicking the "Reset View" button in the top toolbar glides the camera back to the default overview position.
