## Context

Currently in `RackMesh.tsx`, the scale animation condition inside `useFrame` flattens racks (`targetScaleY = 0.01`) only when `workspaceMode === 'ISOLATION_SELECT'` or `'ISOLATION_VIEW'`. In standard selection mode (`selectedRackId !== null`), the selected rack transforms into an X-ray glass enclosure, but all unselected racks remain at full 2-meter height. Operators inspecting racks in dense rows have their camera view obstructed by adjacent tall racks.

## Goals / Non-Goals

**Goals:**
- Update `RackMesh.tsx` so that when ANY rack is selected (`hasAnySelection === true`), only the selected rack stays at full height (`scale.y = 1.0`), while unselected racks flatten down to low floor tiles (`scale.y = 0.01`).
- Preserve isolation mode behavior (`ISOLATION_SELECT` / `ISOLATION_VIEW`).
- Ensure smooth frame lerp animations during selection and deselection transitions.

**Non-Goals:**
- Altering the 2D rack slot editor or backend API.

## Decisions

### Decision 1: Elevation Condition Logic in `RackMesh.tsx`
- **Choice**:
  Compute `hasAnySelection` from `selectedRackDetails !== null`.
  A rack is elevated if:
  1. It is selected (`isSelected === true`), OR
  2. No rack is selected and no isolation mode is active (`!hasAnySelection && !inIsolation`), OR
  3. It is included in active isolation selection (`inIsolation && isolatedRackIds.includes(rack.id)`).
- **Rationale**: Single condition handles normal view (all elevated), single selection (active rack elevated, rest flattened), and isolation selection cleanly.

## Risks / Trade-offs

- **[Risk] Rapid Selection Flickering** → *Mitigation*: The existing `THREE.MathUtils.lerp(..., delta * 8)` creates smooth Y-scaling without abrupt visual jumps.
