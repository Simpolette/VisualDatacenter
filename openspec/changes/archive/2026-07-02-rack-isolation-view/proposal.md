# Proposal: Rack Isolation View Mode

## Problem Statement

When server rooms grow large and contain dozens of racks, inspecting a subset of racks becomes visually cluttered due to adjacent cabinets blocking the viewport. Users need a way to filter out surrounding cabinets and focus solely on a selected subgroup of racks in both 2D and 3D, without deleting or permanently moving other equipment.

## User Story

```
As a datacenter technician
I want to toggle an "Isolation Mode" and drag-select a subset of racks
So that the selected racks elevate into view while other racks shrink into flat floor outlines, and the camera focuses directly on my selection.
```

## Capabilities

1. **Isolation Mode Toolbar Control**
   - A toggle button on the Room Details top toolbar labeled "Isolate" with a focus icon.
   - Clicking this enters `ISOLATION_SELECT` mode.

2. **Drag-to-Select Bounding Box in 3D**
   - In `ISOLATION_SELECT` mode, all racks scale down to flat 2D footprint markers on the floor.
   - Clicking and dragging on the floor plane draws a transparent selection rectangle.
   - Racks whose center coordinates fall within the rectangle are selected/highlighted.
   - Releasing the drag confirms the selection and enters `ISOLATION_VIEW` mode.

3. **Smooth Elevation and Outline Footprints**
   - Racks in the selection smoothly elevate back to full height using Y-scale animation.
   - Non-selected racks remain as flat 2D lines/footprints on the ground plane, preventing obstruction.
   - Opacity of non-selected footprints is set to `0.15` to keep them minimally visible.

4. **Camera Focus on Isolated Group**
   - The camera automatically transitions to a flat, direct orthographic-like angle centered on the bounding box of the isolated racks.

## Out of Scope (Non-Goals)

- Persisting the isolation state to the database (it is a local viewport filter).
- Hiding PDUs or devices inside isolated racks (they are fully rendered for elevated racks).
- Supporting multi-floor rooms.
