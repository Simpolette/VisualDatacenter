# Visual Datacenter — Project Proposal

## 1. Problem Statement

Datacenter operators and infrastructure teams today manage server rooms using static spreadsheets, disconnected asset databases, or physical walk-throughs. This approach creates several critical pain points:

*   **No Spatial Awareness**: Administrators cannot visualize how racks are physically arranged on the server room floor, making capacity planning and equipment placement a guessing game.
*   **No Rack-Level Visibility**: There is no interactive view showing which U-slots in a rack are occupied, by what device, and how much free space remains. Teams rely on manual documentation that quickly becomes stale.
*   **Capacity Blind Spots**: Without clear visual indicators of rack utilization (e.g., how many U-slots are free compared to a warning threshold), it is difficult to identify over-provisioned or under-utilized racks at a glance.
*   **Costly On-site Inspections**: Verifying device placement, checking power distribution unit (PDU) positions, or planning new installations requires physical presence in the server room, which is both expensive and time-consuming.

**Visual Datacenter** addresses these issues by providing an interactive simulation system that combines a detailed 2D rack layout editor with a full 3D server room visualization powered by Three.js. This enables remote spatial awareness, rack-level capacity monitoring, and safe sandbox operations from any browser.

---

## 2. Project Goals

The primary goal of the Visual Datacenter project is to deliver a lightweight, web-based simulation environment that assists infrastructure teams in room management, device placement, and capacity visualization.

| Goal | Success Criteria / Target |
| :--- | :--- |
| **Server Room Management** | Full CRUD capabilities for rooms, including metadata, area sizing (`widthM`, `lengthM`), and grid layout coordinates. |
| **Equipment Inventory** | Manage racks (42U/44U heights), PDUs, servers, blades, and catalog device templates (height, width, length, weight, dual-face front/rear image assets). |
| **2D Rack Simulation** | Interactive 2D view of a rack allowing users to insert, view, and remove devices from U-slots with backend collision validation and orientation rendering. |
| **3D Room Visualization** | Three.js-powered 3D floor plan representing racks and internal devices visually at their physical coordinates with dual-face texture mapping. |
| **Capacity at a Glance** | Dynamic color-coding of racks in 3D (normal mode and X-ray mode frame tinting) representing utilization thresholds (High ≥80% Red, Medium ≥50% Yellow, Low <50% Green). |
| **Search & Isolate** | Ability to search for specific racks by name, visually isolate selected racks by dimming others (opacity `0.15`), and transition seamlessly to 2D view. |
| **Device Inspection** | Interactive hover/select in 3D to show device-specific specifications (dimensions, slots, status). |

---

## 3. Users and Needs

The system operates as a single-user **sandbox model** in the MVP phase. It focuses on functional visualization without authentication overhead.

### Target User Role
*   **Datacenter Operations Manager / Systems Engineer**: A user responsible for planning rack layout, capacity allocation, equipment orientation, and monitoring server room utilization.

### Key User Needs
*   **Room Layout Planning**: Needs to drag and position racks onto a grid layout representing the physical room floor.
*   **Device Placement Safety & Orientation**: Needs validation to prevent overlapping devices (U-slot collisions), physical dimension checks.
*   **Visual Capacity Monitoring**: Needs a quick way to identify which racks are nearing capacity limits (utilization heatmaps) without opening each one individually.
*   **Remote Inspection**: Needs to hover over 3D models to retrieve device catalog parameters (name, category, size, dual faceplate visuals) instantly.

---

## 4. Scope

### In Scope (MVP)

*   **Server Room Management**: Create, update, list, inspect, and delete server rooms (name, floor area, dimensions `widthM`, `lengthM`).
*   **Rack Management**: Configure racks with standard heights of 42U or 44U. Place racks dynamically in the room using X/Y coordinates (1.0m grid snapping) and rotation angles (90-degree steps).
*   **Device Type Catalog**: Maintain templates for devices (Servers, Blades, PDUs, Switches) containing physical dimensions (height in U, width, length, weight) and distinct front and rear faceplate image paths (`frontImagePath`, `rearImagePath`).
*   **Device & PDU Installation**:
    *   Install devices into specific U-slots (validation: `startU >= 1`, slot height check, overlap/collision prevention on mounting face).
    *   Attach PDUs per rack on `LEFT`, `RIGHT`, or `REAR` positions (maximum 1 PDU per position, max 3 PDUs per rack).
*   **2D Rack View**: Interactive visual list of U-slots in a single rack. Support operations to install new devices, remove existing ones.
*   **3D Room View (Three.js)**:
    *   Interactive floor grid with physical rack models positioned dynamically.
    *   Orbit, pan, and zoom camera controls with vertical polar angle bounds (`maxPolarAngle <= 85°`) and reset view animation.
    *   Interactive rack selection, search by name, visual isolation (dimming non-selected racks to `0.15` opacity), and camera focus transition.
    *   Hover tooltips showing detailed device specs.
    *   Dynamic rack color-coding (High ≥80% Red, Medium ≥50% Yellow, Low <50% Green) active across normal rendering, selected highlight state, and X-ray mode outer-frame tinting.
    *   Dual-face material mapping rendering front textures on front face and rear textures on rear face.
*   **Telemetry & Live Telemetry Streams**:
    *   Query standard OID metrics from mock SNMP server (CPU, RAM, Temp, Network, uptime) and holding register data from Modbus UPS server (Battery %, Volts, Load, Temp).
    *   Establish real-time, sub-second Server-Sent Events (SSE) streams for UI updates (`/ups/stream`, `/rack/{id}/stream`) utilizing in-memory cache to ensure latency < 1 second.
*   **Observability Infrastructure**:
    *   Full metrics, logs, and distributed traces collection via Prometheus, Grafana, Loki, Tempo, and Promtail.
*   **Decoupled Architecture**: Separate frontend and backend structures to allow independent development, building, and serving.
*   **Containerized Environment**: Package both frontend, backend, mock hardware components, and the full observability stack within Docker images, supporting local orchestration via Docker Compose.

### Out of Scope (Non-Goals)

*   **User Authentication & Authorization**: No user login, registration, or Role-Based Access Control (RBAC) in the sandbox model.
*   **Cabling & Network Topology**: Visualization of network connections and cable paths is deferred.
*   **Multi-Room/Multi-Floor Synchronization**: The 3D view focuses on a single room environment at a time.
*   **Collaboration Features**: Multi-user editing of the same room simultaneously is not supported.

---

## 5. Risks and Constraints

| Identified Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Three.js rendering lag / crash with 10k+ devices** | High | Use instanced meshes (InstancedMesh), deferred component loading, frustum culling. Verified memory management and FPS > 40 on 10,000+ devices. |
| **U-Slot Collision validation errors** | High | Enforce server-side transactional validation on device placement; treat the backend as the authoritative source of truth. |
| **WebGL browser support limitations** | Low | Target modern evergreen browsers (Chrome, Edge, Firefox, Safari) and display a graceful fallback notice if WebGL is unavailable. |
| **Design / Image Asset Scarcity** | Medium | Integrated comprehensive brand image library in public static assets with fallback textures for unassigned devices. |
| **Loose/Optimistic State Sync** | Medium | Build standard REST endpoints for state queries; both 2D and 3D UI panels pull data from a unified React state store. |
| **Scope Creep into full DCIM systems** | High | Strictly adhere to the out-of-scope boundaries specified in this document. |
