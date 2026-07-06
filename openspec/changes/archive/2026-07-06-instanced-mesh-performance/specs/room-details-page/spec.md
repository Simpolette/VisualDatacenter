## MODIFIED Requirements

### Requirement: 3D floor plan visualization
The Room Details page SHALL render a 3D floor plan representing the room's dimensions and the positions of all racks in the room. Racks SHALL be rendered using an `InstancedMesh`-based bulk renderer for unselected racks, with only the selected rack rendered as a standalone detailed component.

#### Scenario: Rendering the 3D scene
- **WHEN** the Room Details page loads successfully
- **THEN** the application renders a 3D canvas with a floor plane scaled to widthM and lengthM, and renders all room racks via an InstancedMesh component positioned at their posX and posY coordinates

#### Scenario: Zooming and rotating the scene
- **WHEN** the user drags or scrolls on the 3D scene canvas
- **THEN** the CameraControls adjust the camera zoom, rotation, and panning dynamically

### Requirement: Selected rack 3D X-Ray visualization and device stack
When a rack is selected in the 3D viewport, the system SHALL visualize the rack as a transparent open-frame cabinet containing stacked 3D device meshes. The selected rack SHALL be rendered as a standalone React component separate from the InstancedMesh, and its corresponding instance in the InstancedMesh SHALL be hidden.

#### Scenario: Selected rack cabinet mesh changes to translucent frame
- **WHEN** the user selects a rack in the 3D viewport
- **THEN** the rack's instance in the InstancedMesh is hidden (scale 0), and a standalone component renders the rack mesh as a translucent glass cabinet enclosure with 4 metallic corner post meshes, edge outlines, and device/PDU children

#### Scenario: Deferred device mesh mounting prevents dimension flash
- **WHEN** the user selects a rack in the 3D viewport and detailed rack details are fetching over the network
- **THEN** the 3D canvas opens the open-frame cabinet shell and defers rendering individual 3D device chassis meshes until `isDetailsLoaded` is true, ensuring devices appear cleanly with their exact physical dimensions

#### Scenario: Unselecting a rack restores instanced rendering
- **WHEN** the user unselects a currently selected rack
- **THEN** the standalone component is removed and the rack's instance in the InstancedMesh is restored to visible (scale 1.0) with its utilization-based color

#### Scenario: Individual devices render inside selected rack mesh with physical sizes
- **WHEN** the 3D viewport renders the devices of a selected rack
- **THEN** each device renders as a separate box mesh centered on its occupied U-slots, with its height proportional to its `heightU`, its width matching its `widthMm` value (fallback to 0.4826m), and its length matching its `lengthMm` value

#### Scenario: Device mesh faceplate texture matches mount orientation
- **WHEN** a device mesh is rendered in the stack
- **THEN** if the device is `FRONT` mounted, its front-panel bezel texture loaded via `useTexture` is mapped to the positive Z face of its geometry and its length aligns with the front of the rack; if the device is `REAR` mounted, its front-panel bezel texture is mapped to the negative Z face of its geometry and its length aligns with the back of the rack
