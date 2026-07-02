## Context

Currently, the `RoomDetailsPage.tsx` has a separate top page header displaying room metadata and statistics, while the 3D canvas viewport has margins/borders separating it from the slide-out inspector sidebar. We will merge the header metadata into a unified top toolbar, turn statistics into floating viewport overlays, and connect toggles to dynamically customize the 3D scene options.

## Goals / Non-Goals

**Goals:**
- Design a compact, unified toolbar spanning the top of the room workspace container.
- Integrate Room back navigation, title, floor, and dimensions into the left of the toolbar.
- Implement camera reset, grid, and labels toggle controls in the center.
- Position the primary "Add Rack" button on the right.
- Move the room capacity statistics (Total Racks, Occupancy U-slots, and percentage) to a floating overlay card in the top-right corner of the canvas.
- Remove padding/margins between the sidebar and the canvas viewport, making them flush.

**Non-Goals:**
- Implementing the detailed "Add Rack" form modal/wizard workflow (this change only adds the trigger button).
- Storing toolbar preferences (like grid show/hide) in database or local storage.

## Decisions

### 1. Toggle State Propagation
Manage the toolbar toggle states (`showGrid` and `showLabels`) in `RoomDetailsPage.tsx` and pass them as standard props to `RoomScene3D.tsx`.
*   *Rationale:* Simple prop drilling is perfectly suitable here since `RoomScene3D` is a direct child of the details page container. It avoids introducing state complexity.

### 2. Camera Reset Mechanism
Implement a `resetKey` state (e.g. a simple counter or timestamp) in `RoomDetailsPage.tsx` that gets incremented when the "Reset View" button is clicked. Pass it to `RoomScene3D` to force the `SceneControls` to snap the camera back to the general overview target.
*   *Rationale:* Since React Canvas runs in its own context, passing a resetting dependency key is a clean way to trigger imperative Three.js animations without using complex forwardRefs.

### 3. Edge-to-Edge Sidebar Integration
Remove padding around the main workspace container (`h-[calc(100vh-6rem)]`) and let the absolute-positioned `RackSidebar2D` slide flush against the right boundary of the container, covering the canvas and top toolbar area appropriately.
*   *Rationale:* Prevents awkward double-borders and matches typical high-end workspace application layouts (e.g. AutoCAD, Figma).

## Risks / Trade-offs

- **Z-Index Layering on Canvas**: Floating HTML cards over the WebGL `<Canvas>` can block mouse dragging if not styled properly.
  *   *Mitigation:* Set the floating overlays wrapper container to `pointer-events-none`, and apply `pointer-events-auto` only to interactive button/card items.
