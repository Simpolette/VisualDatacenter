## Why

Currently, server racks in the 3D datacenter room render as solid color-blocked meshes representing utilization, and the 2D sidebar renders devices as plain uniform cards with simple icons. This lacks the visual fidelity required for realistic rack inspection, and does not reflect varying device physical sizes (depths) or front panel appearances (bezel images). This change introduces detailed, high-fidelity rack and device visualizations in both 2D and 3D.

## What Changes

- **Backend Asset Hosting**: Store and serve device type front-panel images directly from the backend's static resource directory.
- **DTO Model Extension**: Extend `RackDetailDTO.DeviceSummary` to include device dimensions (`widthMm`, `lengthMm`, `weightKg`), category, and `imagePath` to provide necessary visual metadata to the client.
- **Vite Proxy Config**: Update Vite server proxy settings to route `/images` requests to the Spring Boot backend during development.
- **Realistic 2D Faceplates**: Modify the 2D Rack Inspector sidebar to render device slots as realistic front-panel bezels (using backend bezel images if available, or highly detailed CSS-simulated chassis faceplates with mounting screws, vent lines, and glowing status LEDs).
- **3D X-Ray Rack Enclosure**: Update the 3D selected rack representation to transform from a solid block to a translucent cabinet (open frame style with four metallic corner columns and a transparent glass shell).
- **3D Device Mesh Stacking**: Render individual 3D box meshes inside the selected rack frame representing each installed device. The box dimensions will correspond to the device's physical dimensions (height in U, width, and depth).
- **3D Faceplate Texture Orientation**: Texture the front face of each device box with its front-panel bezel image, ensuring its orientation and position align correctly with the front of the rack based on the device's mounting face (`FRONT` or `REAR`).

## Capabilities

### New Capabilities

*None.*

### Modified Capabilities

- `room-details-page`: Add detailed rack 2D/3D visualizations, physical device sizing in 3D, and faceplate image/CSS rendering requirements.

## Impact

- **Database / Entities**: No schema modifications are required (the `DeviceType` table already contains `width_mm`, `length_mm`, `weight_kg`, and `image_path` columns).
- **Backend API**: `RackDetailDTO.DeviceSummary` will be updated to include the missing fields from the `DeviceType` entity.
- **Frontend Store**: Update `DeviceSummary` in `useRackStore.ts` to include the new metadata fields.
- **Frontend Viewports**:
  - `vite.config.ts` (Proxy addition)
  - `RackSidebar2D.tsx` (Realistic card rendering, CSS fallback chassis design)
  - `RoomScene3D.tsx` (Translucent rack shell, dynamic 3D device stacking, multi-material texture mapping)
