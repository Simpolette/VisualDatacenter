# Visual Datacenter — Project Proposal

## Problem

Datacenter operators and infrastructure teams today manage server rooms using static spreadsheets, disconnected asset databases, or physical walk-throughs. This approach creates several pain points:

- **No spatial awareness** — administrators cannot visualize how racks are physically arranged on the server room floor, making capacity planning and equipment placement guesswork.
- **No rack-level visibility** — there is no interactive view showing which U-slots in a rack are occupied, by what device, and how much free space remains. Teams rely on manual documentation that quickly becomes stale.
- **Blind spot on capacity** — without a clear visual indicator of rack utilization (e.g., how many U-slots are free vs. a threshold), it is difficult to identify over-provisioned or under-utilized racks at a glance.
- **Costly on-site inspections** — verifying device placement, checking power distribution unit (PDU) positions, or planning new installations requires physical presence in the server room—an expensive and time-consuming process.

Visual Datacenter replaces this with an interactive simulation system that provides both a 2D rack view for detailed equipment management and a full 3D server room visualization powered by Three.js, enabling remote spatial awareness, drag-and-drop device operations, and real-time capacity monitoring from any browser.

## Goals


| Goal                        | Target / success signal                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Server room management**  | Full CRUD for server rooms including floor area, room layout/floor plan, and metadata                                     |
| **Equipment inventory**     | Manage racks (42U/44U), PDUs, servers, blades, and other devices with dimensions and images                               |
| **2D rack simulation**      | Interactive front-view of a rack showing occupied/free U-slots; drag-and-drop to install or remove devices                |
| **3D room visualization**   | Three.js-powered 3D floor plan with racks placed on it; orbit, zoom-in/out controls for full spatial navigation           |
| **Capacity at a glance**    | Color-coded racks in the 3D view based on free-U count vs. configurable thresholds (e.g., green/yellow/red)               |
| **Search and isolate**      | Locate a specific rack in the 3D scene, isolate it visually, and switch to its 2D detail view                             |
| **Device inspection**       | Hover or click any device in the 3D scene to view its specifications (name, dimensions, position, status)                 |


## Users and Needs

The system operates as a **sandbox** — a single user type with full access to all features. There is no authentication or role separation in the MVP; any user who opens the application can:

- Create and configure server rooms (floor area, layout)
- Manage racks (create, position on floor plan, configure 42U/44U)
- Manage devices (servers, blades, PDUs, etc.) with dimensions and images
- Install or remove devices in racks via the interactive 2D rack view
- Explore the 3D server room visualization — orbit, zoom, search, isolate racks
- Inspect device details by hovering or clicking in both 2D and 3D views
- Monitor rack capacity via color-coded utilization indicators

Role-based access control (e.g., read-only viewer vs. editor) can be layered on top in a future phase without architectural changes.


## Scope

### In scope (MVP)

- **Server room management**: CRUD operations for server rooms — name, location, floor area, floor-plan image/dimensions, and general metadata
- **Rack management**: Create and configure racks (42U or 44U height); assign racks to a room with x/y/rotation coordinates on the floor plan
- **Device catalog**: Manage device types (server, blade, PDU, switch, etc.) with height (in U), width, depth, weight, and representative image
- **Device-to-rack assignment**: Install a device into a specific U-slot in a rack; validate fit (height in U, no overlap); remove/relocate devices
- **PDU management**: Attach power distribution units to the rear or sides of a rack
- **2D rack visualization**: Interactive front-face diagram of a single rack; shows occupied and free U-slots; supports drag-and-drop to add or remove devices; displays device images scaled to their U-height
- **3D room visualization (Three.js)**: Render the server room floor as a 3D plane; place rack models on the floor at their assigned coordinates; orbit controls (rotate, zoom, pan)
- **3D interaction**: Click a rack to select it; hover a device to show an info tooltip; search a rack by name and fly the camera to it; isolate a rack (dim all others); transition from 3D rack to its 2D detail view
- **Capacity color coding**: Racks in the 3D view are colored based on free-U percentage against configurable thresholds (e.g., >50% free → green, 20–50% → yellow, <20% → red)
- **Backend API**: RESTful API (Spring Boot) for all CRUD and query operations; serves data to the frontend
- **Frontend SPA**: Single-page application consuming the API; hosts both the 2D and 3D views

### Out of scope (non-goals)

- **Authentication and role separation** — no login, no RBAC; the app is a sandbox where any user has full access. Roles can be layered later
- Real-time environmental monitoring (temperature, humidity, power draw sensors)
- Network topology mapping and cable management visualization
- Multi-floor or multi-building datacenter support — single room per view in MVP
- Automated device discovery (SNMP, IPMI, or similar protocols)
- Production deployment to cloud infrastructure (Docker, Kubernetes, CI/CD)
- Real-time collaboration (multi-user editing of the same room simultaneously)
- Detailed power and cooling capacity planning calculations
- Integration with third-party DCIM (Data Center Infrastructure Management) tools

## Risks and Constraints


| Risk                                          | Mitigation                                                                                                              |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Three.js performance with large rack counts   | Use instanced meshes and LOD (Level of Detail); limit initial MVP to a reasonable room size (e.g., ≤200 racks)          |
| Complex 3D interaction on low-end hardware    | Provide graceful degradation; fallback to simplified geometry; test on integrated GPUs                                  |
| Accurate U-slot collision detection           | Enforce server-side validation of slot occupancy before persisting; frontend is optimistic but API is authoritative      |
| Device image diversity                        | Provide a default placeholder model/image; allow admins to upload custom images per device type                         |
| 2D ↔ 3D state synchronization                | Single source of truth in the backend; both views query the same API; optimistic UI with refetch on mutation            |
| Scope creep into full DCIM                    | Explicit non-goals above; strict MVP boundary; environmental monitoring and network topology deferred to future phases  |
| Small team and tight timeline                 | Monorepo structure (Spring Boot + SPA); no microservices; reuse Three.js ecosystem libraries where possible             |
| Browser compatibility for WebGL / Three.js    | Target modern evergreen browsers (Chrome, Edge, Firefox); document minimum GPU requirements                             |

