## MODIFIED Requirements

### Requirement: Selected rack 3D X-Ray visualization and device stack
When a rack is selected in the 3D viewport, the system SHALL visualize the rack as a transparent open-frame cabinet containing stacked 3D device meshes:
- The outer enclosure of the selected rack SHALL render as an open-frame translucent glass mesh (`opacity: 0.15`) with open front (+Z) and rear (-Z) faces to provide an unobstructed view of equipment.
- The cabinet frame SHALL render 4 vertical black metal corner posts.
- Each device installed in the rack SHALL render as a distinct 3D box mesh situated inside the rack frame.
- The height of each device mesh SHALL match its `heightU` dimension scaled to the rack's unit height.
- The width of each device mesh SHALL match its `widthMm` scaled to meters, with a fallback to standard 19-inch mounting width (0.4826m).
- The length of each device mesh SHALL match its `lengthMm` scaled to meters.
- The front face of each device mesh SHALL be textured with the device type's front-panel bezel image loaded via `@react-three/drei`'s `useTexture` hook (or a fallback dark slate faceplate if no image is available).
- The faceplate texture and length positioning of each device mesh SHALL align with the front of the rack if mounted `FRONT` (case-insensitive default), and align with the back of the rack if mounted `REAR`.
- Internal 3D device meshes SHALL only render once detailed backend rack information (`isDetailsLoaded`) is loaded, preventing visual size flashing from fallback dimensions.
- When a rack is unselected, the system SHALL cleanly transition back to its solid utilization clay box using distinct element keys (`rack-solid-{id}` and `rack-xray-{id}`) to prevent multi-material state reconciliation leaks.
- **Each device mesh SHALL respond to pointer events: `onPointerOver` to display a hover tooltip and emissive glow, `onPointerOut` to clear hover state, and `onClick` to set the global `selectedDeviceId` in `useRackStore`.**

#### Scenario: Selected rack cabinet mesh changes to translucent frame
- **WHEN** the user selects a rack in the 3D viewport
- **THEN** the rack mesh transitions from a solid color-blocked clay box to a translucent glass cabinet enclosure with 4 metallic corner post meshes.

#### Scenario: Deferred device mesh mounting prevents dimension flash
- **WHEN** the user selects a rack in the 3D viewport and detailed rack details are fetching over the network
- **THEN** the 3D canvas opens the open-frame cabinet shell and defers rendering individual 3D device chassis meshes until `isDetailsLoaded` is true, ensuring devices appear cleanly with their exact physical dimensions.

#### Scenario: Unselecting a rack restores solid clay box
- **WHEN** the user unselects a currently selected rack
- **THEN** the system tears down the open-frame X-ray mesh and reinstantiates a clean solid clay box mesh with fully opaque faces matching the rack's capacity color.

#### Scenario: Individual devices render inside selected rack mesh with physical sizes
- **WHEN** the 3D viewport renders the devices of a selected rack
- **THEN** each device renders as a separate box mesh centered on its occupied U-slots, with its height proportional to its `heightU`, its width matching its `widthMm` value (fallback to 0.4826m), and its length matching its `lengthMm` value.

#### Scenario: Device mesh faceplate texture matches mount orientation
- **WHEN** a device mesh is rendered in the stack
- **THEN** if the device is `FRONT` mounted, its front-panel bezel texture loaded via `useTexture` is mapped to the positive Z face of its geometry and its length aligns with the front of the rack; if the device is `REAR` mounted, its front-panel bezel texture is mapped to the negative Z face of its geometry and its length aligns with the back of the rack.

#### Scenario: Device meshes respond to pointer events
- **WHEN** a device mesh is rendered inside a selected rack's X-ray view
- **THEN** the device mesh SHALL have `onPointerOver`, `onPointerOut`, and `onClick` handlers that trigger hover tooltip display, hover glow effects, and device selection via the global store respectively.
