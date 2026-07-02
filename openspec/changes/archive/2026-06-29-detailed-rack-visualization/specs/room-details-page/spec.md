## ADDED Requirements

### Requirement: Realistic 2D rack device faceplate rendering
The Rack Manager 2D sidebar panel SHALL render realistic equipment faceplates for each device in the U-slot grid:
- If a front bezel image is available on the backend via the device type's `imagePath`, the sidebar card SHALL render the image as the background cover of the card with a readability-optimizing vignette overlay.
- If no image is available, the sidebar card SHALL render a simulated CSS chassis faceplate, including vertical rack ear bars with mounting screw details in the corners, horizontal ventilation slots scaling with the device's U-height, and a glowing status LED indicator representing the device status (`ACTIVE` -> pulsing green, `MAINTENANCE` -> pulsing amber, `OFFLINE` -> pulsing red).

#### Scenario: Rendering device card with bezel image
- **WHEN** the 2D sidebar grid renders a device that has a valid front-panel image path
- **THEN** the device card displays the backend-served bezel image as its background cover with overlayed text and status badge.

#### Scenario: Rendering device card with fallback CSS faceplate
- **WHEN** the 2D sidebar grid renders a device that does not have a front-panel image
- **THEN** the device card renders a slate-gradient bezel background with metallic ear plates, screw details, ventilation slots, and a pulsing status LED matching the device status.

### Requirement: Selected rack 3D X-Ray visualization and device stack
When a rack is selected in the 3D viewport, the system SHALL visualize the rack as a transparent open-frame cabinet containing stacked 3D device meshes:
- The outer enclosure of the selected rack SHALL render as a translucent glass mesh (`opacity: 0.15`).
- The cabinet frame SHALL render 4 vertical black metal corner posts.
- Each device installed in the rack SHALL render as a distinct 3D box mesh situated inside the rack frame.
- The height of each device mesh SHALL match its `heightU` dimension scaled to the rack's unit height.
- The depth (length) of each device mesh SHALL match its `lengthMm` scaled to meters.
- The front face of each device mesh SHALL be textured with the device type's front-panel bezel image (or a fallback dark slate faceplate if no image is available).
- The faceplate texture and depth positioning of each device mesh SHALL align with the front of the rack if mounted `FRONT`, and align with the back of the rack if mounted `REAR`.

#### Scenario: Selected rack cabinet mesh changes to translucent frame
- **WHEN** the user selects a rack in the 3D viewport
- **THEN** the rack mesh transitions from a solid color-blocked clay box to a translucent glass cabinet enclosure with 4 metallic corner post meshes.

#### Scenario: Individual devices render inside selected rack mesh with physical sizes
- **WHEN** the 3D viewport renders the devices of a selected rack
- **THEN** each device renders as a separate box mesh centered on its occupied U-slots, with its height proportional to its `heightU` and its depth matching its `lengthMm` value.

#### Scenario: Device mesh faceplate texture matches mount orientation
- **WHEN** a device mesh is rendered in the stack
- **THEN** if the device is `FRONT` mounted, its front-panel bezel texture is mapped to the positive Z face of its geometry and its depth aligns with the front of the rack; if the device is `REAR` mounted, its front-panel bezel texture is mapped to the negative Z face of its geometry and its depth aligns with the back of the rack.
