## Context

The current Room Details page features a 3D room canvas and a 2D sidebar inspector. The server racks are rendered in 3D as solid colored blocks based on utilization, and the devices are displayed in the 2D sidebar as plain card lists. To deliver a realistic datacenter simulation experience, users require an interactive "X-Ray" inspection mode in 3D (where racks reveal their internal device layout and sizes) and high-fidelity front panel designs in 2D.

## Goals / Non-Goals

**Goals:**
- Store and serve device bezel images from the Spring Boot backend (`backend/src/main/resources/static/images/`).
- Update the API contract to send device dimensions and image paths to the client.
- Update Vite config to proxy `/images` to the Spring Boot dev server (port 8080).
- Update the 2D sidebar to render realistic equipment faceplates (using image asset or fallback CSS chassis).
- Implement 3D X-Ray mode: render a selected rack as a translucent open-frame cabinet with corner posts.
- Render physical 3D box meshes inside the selected rack representing each device, with height matching `heightU` and depth matching `lengthMm`.
- Align 3D device front-panel textures to match the rack's front face depending on mount orientation (`FRONT` vs `REAR`).

**Non-Goals:**
- Creating an image upload/management feature for users in the UI.
- Visualizing interior components of the server chassis (e.g. CPUs, RAM, motherboard) in 3D.
- Visualizing PDUs in the 3D scene (this will remain 2D-only for now).

## Decisions

### 1. Static Bezel Assets Hosting on Backend
- **Decision**: Store all front-panel bezel images inside the Spring Boot backend under `backend/src/main/resources/static/images/` and expose them via standard static file serving.
- **Rationale**: Keeps catalog images co-located with the backend service. Since the `DeviceType` table stores the relative path (e.g., `/images/dell-r740.png`), serving them from the backend allows a unified source of truth for assets.
- **Alternatives Considered**: Storing them in the frontend public folder. However, this separates the database catalog paths from where the images live, making database seed URLs dependent on the client host folder.

### 2. Vite Proxy Configuration
- **Decision**: Add `/images` to Vite's proxy config, forwarding it to `http://localhost:8080`.
- **Rationale**: Allows the frontend to resolve relative URLs like `/images/...` to the backend server during development, eliminating CORS issues and absolute URL hardcoding.

### 3. Fallback CSS 2D Bezel Renderer
- **Decision**: If a device does not have an image path (or fails to load), render a high-fidelity CSS-based simulated chassis front panel.
- **Rationale**: Ensures the UI looks polished and consistent even if some custom device types don't have front panel images. Using HSL gradients, metallic rack ears, ventilation lines, and pulsing LEDs provides a premium look.

### 4. 3D X-Ray Selected Rack representation
- **Decision**: Transition the selected rack mesh into a transparent glass shell (`opacity: 0.15`) with 4 black metal corner posts.
- **Rationale**: Creating an "open-frame cabinet" style allows users to see the inner device stack clearly while maintaining the boundaries of the rack structure.

### 5. Multi-Material Box Texturing and Orientation in 3D
- **Decision**: Represent each device in 3D as a box mesh with a 6-material array:
  - If `face === 'FRONT'`: Apply front panel texture to Face Index 4 (Positive Z), back panel texture to Face Index 5 (Negative Z), and position the box offset towards the front ($z = \frac{meshLength - devDepth}{2}$).
  - If `face === 'REAR'`: Apply front panel texture to Face Index 5 (Negative Z), back panel texture to Face Index 4 (Positive Z), and position the box offset towards the back ($z = -\frac{meshLength - devDepth}{2}$).
- **Rationale**: This aligns the front faceplate texture with the actual front face direction of the rack (local Positive Z) regardless of whether the device is front-mounted or rear-mounted, satisfying the physics of server mounting.

## Risks / Trade-offs

- **[Risk] Texture Loading Suspend in Three.js** $\rightarrow$ If a texture fails to load (404), the canvas could suspend or crash.
  - *Mitigation*: Implement an asynchronous texture loader helper with `onError` fallbacks that returns a simple colored material if the image cannot be loaded.
- **[Risk] Z-Fighting with Overlapping Meshes** $\rightarrow$ Rendered device edges might overlap with cabinet wireframes or adjacent devices.
  - *Mitigation*: Apply minor padding offsets (e.g., scale device width slightly down to `0.46m` and decrease device height by `0.005m` to create a realistic physical seam between stacked units).
