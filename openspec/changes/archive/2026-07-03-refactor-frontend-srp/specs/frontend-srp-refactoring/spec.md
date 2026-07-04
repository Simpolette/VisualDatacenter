## ADDED Requirements

### Requirement: Modular 3D Scene Architecture
The 3D room visualization engine SHALL decompose scene controls, rack mesh rendering, device faceplate rendering, and floor raycasting interaction logic into dedicated single-responsibility modules located in `frontend/src/components/RoomDetails/`.

#### Scenario: Decomposed 3D camera controls
- **WHEN** a user selects a rack or resets the camera
- **THEN** camera transition animations and orbit control configurations SHALL be handled by a dedicated `SceneControls` component in `frontend/src/components/RoomDetails/`

#### Scenario: Decomposed 3D rack mesh rendering
- **WHEN** racks are rendered in the 3D room scene
- **THEN** solid utilization clay boxes, X-ray translucent enclosures, and wireframe edges SHALL be rendered by a dedicated `RackMesh` component in `frontend/src/components/RoomDetails/`

### Requirement: Modular Placement and Isolation Raycasting Hooks
The 3D room interaction system SHALL handle floor snapping raycasting and box-selection isolation through custom hooks (`usePlacementControls` and `useIsolationSelect`) located in `frontend/src/hooks/`.

#### Scenario: Interactive rack placement snapping
- **WHEN** the user drags to place a rack on the floor grid
- **THEN** ghost position snapping, rotation calculation, and bounding box clamping SHALL be computed by `usePlacementControls` in `frontend/src/hooks/`

#### Scenario: Rectangle isolation drag selection
- **WHEN** the user drags a selection box on the floor grid in ISOLATION_SELECT mode
- **THEN** rectangle bounds calculations and isolated rack ID filtering SHALL be computed by `useIsolationSelect` in `frontend/src/hooks/`

### Requirement: Modular Workspace Toolbar and 2D Drawer Components
The room workspace UI SHALL separate navigation toolbars, floating room statistics, 2D unit slot grids, and telemetry cards into dedicated React components located in `frontend/src/components/RoomDetails/`.

#### Scenario: Workspace header toolbar rendering
- **WHEN** the user toggles workspace modes, camera resets, or grid/label switches
- **THEN** the toolbar UI and mode alert banners SHALL be rendered by `RoomDetailsHeader` in `frontend/src/components/RoomDetails/`

#### Scenario: 2D Rack unit grid rendering
- **WHEN** a user opens the 2D rack inspection drawer
- **THEN** interactive U1-U44 slot layout rendering SHALL be handled by `RackSlotGrid2D` in `frontend/src/components/RoomDetails/`
