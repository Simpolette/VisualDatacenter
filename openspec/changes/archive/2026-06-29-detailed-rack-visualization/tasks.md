## 1. Backend static assets and DTO changes

- [x] 1.1 Copy the generated device bezel images (`dell-r740.png`, `cisco-9300.png`, `hpe-msa2060.png`) to the backend's static resource directory: `backend/src/main/resources/static/images/`
- [x] 1.2 Extend the `RackDetailDTO.DeviceSummary` record in `RackDetailDTO.java` to return `imagePath`, `category`, `widthMm`, `lengthMm`, and `weightKg` from the associated `DeviceType` entity
- [x] 1.3 Update the frontend store model (`DeviceSummary` in `useRackStore.ts`) to match the new backend DTO response fields

## 2. Frontend environment configuration

- [x] 2.1 Update the Vite server configuration (`vite.config.ts`) to proxy requests starting with `/images` to the Spring Boot backend running on `http://localhost:8080`

## 3. 2D Rack Inspector Faceplate UI

- [x] 3.1 Implement the fallback CSS-simulated chassis faceplate component inside `RackSidebar2D.tsx` featuring glowing status LEDs, vent slots, corner screw details, and monospaced layout
- [x] 3.2 Implement the bezel image renderer inside `RackSidebar2D.tsx` to display backend-served images with a contrast-safe dark vignette overlay when `imagePath` is available
- [x] 3.3 Ensure the 2D rack device grid rows dynamically fit the custom bezel design and maintain readability across 1U, 2U, or larger slots

## 4. 3D Viewport Selected Rack Casing

- [x] 4.1 Update `RackMesh` inside `RoomScene3D.tsx` to render a translucent glass shell box (`opacity: 0.15`, `transparent: true`, `roughness: 0.1`, `metalness: 0.9`) when the rack is selected
- [x] 4.2 Add 4 black metal corner post meshes and support rails to frame the open cabinet when selected

## 5. 3D Device Stacking and Texturing

- [x] 5.1 Create a `RackDevice3D` sub-mesh component inside `RoomScene3D.tsx` to render individual boxes for the devices of a selected rack
- [x] 5.2 Implement height, depth (length), and Y-position calculations based on `heightU`, `lengthMm`, and `startU` parameters
- [x] 5.3 Configure Z-axis depth alignment and texture index mapping: map the bezel texture to Positive Z (face index 4) and align to front if `face === 'FRONT'`; map the bezel texture to Negative Z (face index 5) and align to back if `face === 'REAR'`
- [x] 5.4 Implement texture loading hooks/helpers with standard error boundaries (charcoal fallbacks) to prevent Canvas crashes on missing images
