## 1. Shadow Removal and Scene Cleanup

- [x] 1.1 Remove `castShadow` and `receiveShadow` from all rack meshes in `RackMesh.tsx` (both selected x-ray path and unselected solid path)
- [x] 1.2 Remove shadow configuration from the directional light in `RoomScene3D.tsx` (`castShadow`, `shadow-mapSize-width`, `shadow-mapSize-height`, `shadow-bias`)
- [x] 1.3 Remove `shadows` prop from the `<Canvas>` element in `RoomScene3D.tsx`

## 2. RackInstances Component (InstancedMesh Core)

- [x] 2.1 Create `RackInstances.tsx` component that accepts the `racks` array, `selectedRackId`, `workspaceMode`, `isolatedRackIds`, and `searchMatchedRackIds` as props
- [x] 2.2 Build the `rackIndexMap` (Map<instanceIndex, rackId>) and reverse map from the racks array, rebuilding when `racks` changes
- [x] 2.3 Initialize `<instancedMesh>` with shared `boxGeometry` (RACK_WIDTH × RACK_HEIGHT × rack.length) and a `meshStandardMaterial`, setting `count` to `racks.length`
- [x] 2.4 Populate `instanceMatrix` buffer with each rack's position (`posX`, `posY`), rotation (`rotationDeg`), and scale using `Matrix4.compose()`
- [x] 2.5 Populate `instanceColor` buffer with each rack's utilization-band base color from `UTILIZATION_COLORS`

## 3. Batched Animation (Single useFrame)

- [x] 3.1 Implement a single `useFrame` callback in `RackInstances` that iterates all instances and lerps `scaleY` toward target values (1.0 for elevated, 0.01 for flattened) based on `workspaceMode` and `isolatedRackIds`
- [x] 3.2 Track per-instance `currentScaleY` values in a `Float32Array` ref to avoid allocations per frame
- [x] 3.3 Set the selected rack's instance scale to 0 (hidden) when `selectedRackId` is set, restore to 1.0 when cleared
- [x] 3.4 Mark `instanceMatrix.needsUpdate = true` after the animation loop

## 4. Hover Detection via instanceId

- [x] 4.1 Add `onPointerMove` handler to `<instancedMesh>` that reads `event.instanceId`, maps to rack ID, and updates the hovered instance's color in the `instanceColor` buffer to the utilization hover color
- [x] 4.2 Restore the previously hovered instance's color when the pointer moves to a different instance or leaves the mesh
- [x] 4.3 Set `document.body.style.cursor` to `'pointer'` on hover and `'auto'` on leave
- [x] 4.4 Add `onPointerOut` handler to reset hover state when the pointer leaves the InstancedMesh entirely

## 5. Click Selection via instanceId

- [x] 5.1 Add `onClick` handler to `<instancedMesh>` that reads `event.instanceId`, maps to rack ID, and calls `onSelectRack(rackId)` when in `NORMAL` or `ISOLATION_VIEW` workspace mode
- [x] 5.2 Ignore click events when workspace mode is `PLACEMENT_PENDING`, `PLACEMENT_DRAGGING`, `CREATION_FORM`, or `ISOLATION_SELECT`

## 6. Search Highlight via instanceColor Buffer

- [x] 6.1 Subscribe to `searchMatchedRackIds` from the rack store in `RackInstances`
- [x] 6.2 When `searchMatchedRackIds` changes, update `instanceColor` buffer: matched racks get search match color (`#0284c7`), unmatched racks revert to utilization-band base color
- [x] 6.3 When `searchMatchedRackIds` is null (search cleared), restore all instance colors to utilization-band base colors

## 7. Integrate RackInstances into RoomScene3D

- [x] 7.1 Replace the `racks.map(rack => <RackMesh .../>)` block in `RoomScene3D.tsx` with a single `<RackInstances>` component
- [x] 7.2 Conditionally render a standalone `<RackMesh>` only for the selected rack (when `selectedRackId` is not null), passing the selected rack data
- [x] 7.3 Verify that the selected rack's position, rotation, and x-ray view render correctly outside the InstancedMesh

## 8. GPU Text Labels

- [x] 8.1 Replace `<Html>` label rendering in `RackMesh.tsx` (for the selected rack) with drei `<Text>` component, positioned at `[0, RACK_HEIGHT + 0.35, 0]`
- [x] 8.2 Add instanced or iterated `<Text>` labels in `RackInstances` for each elevated/visible rack, reading the rack name from the index map
- [x] 8.3 Only render labels for racks whose `currentScaleY` is above a visibility threshold (e.g., > 0.5)

## 9. Cleanup and Verification

- [x] 9.1 Remove unused per-rack `useFrame`, `useState(hovered)`, and `useRackStore` subscriptions from `RackMesh.tsx` (now only used for the selected rack)
- [x] 9.2 Remove `<Edges>` overlay from the unselected rack path in `RackMesh.tsx` (no longer rendered — instanced racks don't use it)
- [x] 9.3 Verify utilization color bands match between instanced and standalone rendering (side-by-side visual comparison)
- [x] 9.4 Verify isolation mode: flatten, drag-select, elevate, camera auto-frame all work correctly
- [x] 9.5 Verify search highlight: matched racks turn blue, clearing search restores colors
- [x] 9.6 Verify hover and click selection work on instanced racks
- [x] 9.7 Verify selected rack x-ray, devices, PDUs, edges render correctly as standalone component
