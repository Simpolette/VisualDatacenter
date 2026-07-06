## ADDED Requirements

### Requirement: Shadow rendering disabled for rack meshes
The 3D room scene SHALL NOT use shadow mapping for rack meshes to reduce GPU draw call overhead.

#### Scenario: Directional light shadow configuration
- **WHEN** the 3D room scene initializes
- **THEN** the directional light SHALL NOT have `castShadow` enabled, and no shadow map size SHALL be configured

#### Scenario: Rack meshes do not cast or receive shadows
- **WHEN** rack meshes render in the 3D scene (both instanced and selected)
- **THEN** no rack mesh SHALL have `castShadow` or `receiveShadow` properties enabled

### Requirement: GPU-rendered rack name labels
Rack name labels SHALL be rendered using GPU-based text rendering (drei `<Text>` component) instead of DOM-injected `<Html>` elements, to eliminate DOM overhead at scale.

#### Scenario: Labels render as GPU text
- **WHEN** rack name labels are enabled via the toolbar toggle
- **THEN** each visible rack's label SHALL render using the drei `<Text>` component positioned above the rack at `[0, RACK_HEIGHT + 0.35, 0]`, centered, with a sans-serif font

#### Scenario: Labels only render for elevated racks
- **WHEN** the system is in isolation mode
- **THEN** labels SHALL only render for racks whose scale-Y is above a visibility threshold (elevated/visible racks), not for flattened floor footprint racks

### Requirement: Frame rate performance target
The 3D room visualization SHALL maintain greater than 40 frames per second when rendering a room containing up to 400 racks with 10,000 total devices.

#### Scenario: Full room view at 400 racks
- **WHEN** the 3D scene renders 400 racks in the default room overview camera position
- **THEN** the frame rate SHALL remain above 40 FPS on hardware with a discrete GPU (e.g., GTX 1060 or equivalent)

#### Scenario: Isolation mode with 400 racks
- **WHEN** the user enters isolation mode and selects a subset of racks from a 400-rack room
- **THEN** the frame rate SHALL remain above 40 FPS during the flatten/elevate animation
