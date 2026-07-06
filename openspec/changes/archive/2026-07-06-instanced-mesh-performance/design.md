## Context

The 3D room visualization currently renders each rack as an individual React component (`RackMesh`) with its own `useFrame` callback, Zustand store subscriptions, geometry/material allocations, shadow passes, and DOM-based labels. At ~400 racks this produces ~1,600+ GPU draw calls per frame, 400 `useFrame` callbacks, and 400 DOM elements — far exceeding the WebGL performance budget for interactive frame rates.

The project's NFR mandates FPS > 40 when rendering a room with 10,000+ devices across ~400 racks. Currently, FPS drops below interactive levels at ~300 racks.

Key existing behaviors that must be preserved:
- Utilization-based color coding (green/amber/red bands)
- Search highlight (sky blue color on matched racks)
- Isolation mode (flatten non-isolated racks, elevate isolated ones)
- Hover detection (pointer cursor, color change)
- Click selection (selected rack switches to x-ray view with devices)
- Camera transitions (fly-to on select, auto-frame on isolation)
- Rack name labels above meshes

## Goals / Non-Goals

**Goals:**
- Achieve >40 FPS with 400 racks and 10,000 devices in the 3D room view
- Reduce GPU draw calls from ~1,600 to <20 for rack rendering
- Eliminate per-rack React component overhead (useFrame, useState, store subscriptions)
- Preserve all existing user-facing visual behaviors identically
- Keep the detailed `RackMesh` component for the selected rack (x-ray, devices, PDUs, edges)

**Non-Goals:**
- Instancing devices inside racks (only ~25-50 render at a time for the selected rack — not a bottleneck)
- LOD (level of detail) system — 400 racks don't need distance-based simplification
- Custom shaders or post-processing effects
- Backend API changes

## Decisions

### D1: InstancedMesh for bulk rack rendering

**Decision:** Replace `racks.map(rack => <RackMesh .../>)` with a single `<instancedMesh>` component that renders all unselected racks in 1 draw call.

**Rationale:** Three.js `InstancedMesh` renders N copies of the same geometry with per-instance transforms and colors in a single GPU draw call. At 400 racks, this reduces draw calls from ~800 (body + edge per rack) to 1-2.

**Alternatives considered:**
- *Merged BufferGeometry*: Merge all rack boxes into one geometry. Faster than individual meshes but slower than instancing; no per-instance color without custom attributes. Harder to update on state changes.
- *React.memo + shared geometry refs*: Keep React components but memoize aggressively. Reduces re-renders but doesn't reduce draw calls or `useFrame` overhead. Not sufficient for 400+ racks.

**How it works:**
- A new `RackInstances` component holds the `<instancedMesh>` with `count = racks.length`
- A `Float32Array`-backed `InstancedBufferAttribute` stores per-instance transforms via `Matrix4` (position, rotation, scale)
- A second buffer stores per-instance colors (`instanceColor`) based on utilization band
- The selected rack's instance is scaled to 0 (hidden) and a standalone `<RackMesh>` renders in its place with full detail
- A `rackIndexMap: Map<instanceId, rackId>` enables mapping raycaster hits back to rack data

### D2: Single batched `useFrame` replaces N callbacks

**Decision:** One `useFrame` in `RackInstances` loops through all instance matrices to apply the isolation flatten/elevate animation, replacing 400 individual `useFrame` callbacks.

**Rationale:** `useFrame` callbacks are invoked via React fiber scheduling. 400 callbacks per frame adds measurable JS overhead. A single callback that iterates a typed array is orders of magnitude faster.

**Implementation:**
```
useFrame((_, delta) => {
  for (let i = 0; i < count; i++) {
    const targetScaleY = isElevated(i) ? 1.0 : 0.01
    currentScaleY[i] = lerp(currentScaleY[i], targetScaleY, delta * 12)
    updateInstanceMatrix(i, position, rotation, currentScaleY[i])
  }
  instancedMesh.instanceMatrix.needsUpdate = true
})
```

### D3: Hover via `instanceId` raycasting

**Decision:** Use Three.js raycaster intersection's `instanceId` property on the `InstancedMesh` to detect which rack is hovered, instead of per-component `onPointerOver`/`onPointerOut`.

**Rationale:** InstancedMesh natively supports raycasting and returns `instanceId` in the intersection result. This gives us hover detection with zero per-rack React overhead.

**Implementation:**
- `onPointerMove` on the `<instancedMesh>` checks `event.instanceId`, maps it to a rack via the index map
- Hovered instance color is updated in the `instanceColor` buffer (no React state change)
- Previous hovered instance color is restored
- Cursor style updated via `document.body.style.cursor`
- `onClick` similarly uses `event.instanceId` to trigger rack selection

### D4: Drop shadows entirely

**Decision:** Remove `castShadow` and `receiveShadow` from all rack meshes. Remove `shadow-mapSize` configuration from the directional light.

**Rationale:** Shadow map rendering doubles the draw call count (one shadow pass + one render pass for every shadow-casting mesh). At 400 racks with 2K shadow maps, this alone accounts for ~800 additional draw calls. The visual benefit of rack shadows on a dark floor is minimal.

**Alternatives considered:**
- *Reduce shadow map size to 512×512*: Reduces GPU cost but shadows look blocky. Still adds a shadow pass for every mesh.
- *Baked ambient occlusion texture on floor*: Good visual fidelity but requires pre-computation and doesn't adapt to dynamic rack placement.

### D5: Drop per-instance edge outlines for unselected racks

**Decision:** Remove the `<Edges>` overlay from instanced (unselected) racks. Retain `<Edges>` only on the selected rack's detailed `<RackMesh>` component.

**Rationale:** Unselected racks currently render edges at opacity 0.15 — nearly invisible at room-scale zoom. The `<Edges>` component generates line geometry per rack, adding 400 extra draw calls. The utilization colors provide sufficient visual differentiation. The selected rack (which benefits most from clean box edges) retains its `<Edges>` overlay.

### D6: GPU-rendered text labels replace DOM `<Html>`

**Decision:** Replace drei's `<Html>` component (which injects real DOM divs) with drei's `<Text>` component (which renders via troika-three-text as GPU geometry).

**Rationale:** `<Html>` creates a real DOM element per rack, positioned via CSS `transform`. At 400 racks with labels, the browser's layout engine and compositor struggle with 400 absolutely-positioned, transform-updated elements. `<Text>` renders as a single texture atlas in the GPU pipeline with minimal overhead.

**Additional optimization:** Labels are only rendered for elevated/visible racks. In isolation mode, only the isolated subset gets labels.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Visual regression (colors, animations don't match current behavior) | Side-by-side comparison before/after with a 400-rack test room. All utilization colors, search highlights, and isolation animations must match pixel-for-pixel. |
| `<Text>` font rendering differs from DOM text styling | Use a similar sans-serif font (Inter or system font). Accept minor typographic differences since labels are small and informational. |
| InstancedMesh raycasting performance at 400 instances | Three.js InstancedMesh raycasting is O(N) but at N=400 with box geometry, each raycast completes in <1ms. Not a concern. |
| Complexity increase in the rendering code | The `RackInstances` component is more complex than the current per-rack approach but is a well-established Three.js pattern. Document buffer update patterns clearly. |
| Search-matched racks lose their edge glow | Search-matched racks are highlighted via `instanceColor` (bright blue) which is visually distinct even without edges. The selected rack (which always renders as a standalone component) retains full edge treatment. |
