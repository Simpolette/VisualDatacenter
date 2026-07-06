## ADDED Requirements

### Requirement: InstancedMesh bulk rack rendering
The 3D room scene SHALL render all unselected racks using a single Three.js `InstancedMesh` component instead of individual React `<RackMesh>` components. The InstancedMesh SHALL use a shared `boxGeometry` with per-instance transform matrices and per-instance colors.

#### Scenario: Room loads with 400 racks
- **WHEN** the Room Details page loads with 400 racks
- **THEN** the system renders all racks via a single `<instancedMesh>` element with `count` equal to the number of racks, each instance positioned at its rack's `(posX, posY)` coordinates with the correct `rotationDeg` rotation

#### Scenario: Utilization colors applied per instance
- **WHEN** the InstancedMesh renders rack instances
- **THEN** each instance's color in the `instanceColor` buffer SHALL reflect its utilization band: green for <50%, amber for 50-79%, red for ≥80%, using the same hex values from `UTILIZATION_COLORS`

#### Scenario: Selected rack excluded from instanced rendering
- **WHEN** a rack is selected by the user
- **THEN** that rack's instance in the InstancedMesh SHALL be hidden (scale set to 0), and a standalone detailed `<RackMesh>` component SHALL render in its place with x-ray view, corner pillars, devices, PDUs, and edge outlines

### Requirement: Instance-based hover detection
The InstancedMesh SHALL support per-rack hover detection using Three.js raycaster `instanceId` mapping, providing visual feedback without per-rack React state.

#### Scenario: Hovering over a rack instance
- **WHEN** the user moves the pointer over an instanced rack
- **THEN** the system SHALL identify the hovered rack via `event.instanceId`, update that instance's color in the `instanceColor` buffer to the utilization band's hover color, and set `document.body.style.cursor` to `'pointer'`

#### Scenario: Pointer leaves a hovered rack instance
- **WHEN** the pointer moves away from a hovered rack instance
- **THEN** the system SHALL restore the instance's color to its base utilization color and reset the cursor to `'auto'`

#### Scenario: No rack under pointer
- **WHEN** the pointer moves over the floor plane or empty space with no rack instance intersected
- **THEN** any previously hovered rack's color SHALL be restored and the cursor SHALL reset to `'auto'`

### Requirement: Instance-based click selection
Clicking on an instanced rack SHALL map the `instanceId` to a rack ID and trigger the existing rack selection flow.

#### Scenario: Clicking a rack instance to select it
- **WHEN** the user clicks on an instanced rack in NORMAL or ISOLATION_VIEW workspace mode
- **THEN** the system SHALL map `event.instanceId` to the corresponding rack ID, call `onSelectRack(rackId)`, hide that instance from the InstancedMesh, and render a standalone `<RackMesh>` with full detail

#### Scenario: Clicking the same selected rack again
- **WHEN** the user clicks the standalone selected `<RackMesh>` component
- **THEN** the system SHALL trigger a refocus camera transition to the rack (existing behavior preserved)

### Requirement: Batched isolation animation via single useFrame
The InstancedMesh SHALL animate all rack instances' scale-Y in a single `useFrame` callback to support the isolation flatten/elevate effect.

#### Scenario: Entering isolation select mode
- **WHEN** the workspace transitions to `ISOLATION_SELECT` mode
- **THEN** the single `useFrame` callback SHALL lerp all instance scale-Y values from `1.0` toward `0.01` using frame-rate-independent interpolation at rate `delta * 12`

#### Scenario: Isolation view elevates selected racks
- **WHEN** the workspace is in `ISOLATION_VIEW` mode with `isolatedRackIds` containing specific rack IDs
- **THEN** the `useFrame` callback SHALL lerp isolated rack instances' scale-Y toward `1.0` while non-isolated rack instances' scale-Y continues toward `0.01`, and call `instanceMatrix.needsUpdate = true` after the loop

### Requirement: Search highlight via instance color buffer
The InstancedMesh SHALL visually highlight search-matched racks by updating their per-instance colors in the `instanceColor` buffer.

#### Scenario: Search returns matched racks
- **WHEN** `searchMatchedRackIds` in the rack store contains one or more rack IDs
- **THEN** the InstancedMesh SHALL set matched rack instances' color to the search match color (`#0284c7`) and non-matched racks to their utilization band base color

#### Scenario: Search is cleared
- **WHEN** `searchMatchedRackIds` is set to `null`
- **THEN** all instance colors SHALL revert to their utilization band base colors

### Requirement: Rack-to-instance index mapping
The system SHALL maintain a bidirectional mapping between rack IDs and InstancedMesh instance indices to support raycasting, color updates, and animation targeting.

#### Scenario: Racks array updates
- **WHEN** the `racks` array from the store changes (racks added, removed, or reordered)
- **THEN** the system SHALL rebuild the index mapping and update all instance matrices and colors accordingly
