# Visual Datacenter

**Visual Datacenter** is a high-performance, real-time 3D Datacenter Infrastructure Management (DCIM) and simulation platform. It bridges backend hardware asset management with an interactive, WebGL-based 3D digital twin of high-density datacenter halls.

![Visual Datacenter Banner](https://img.shields.io/badge/DCIM-Digital%20Twin-0284c7?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r170-black?style=for-the-badge&logo=three.js&logoColor=white)

---

## 🎯 Purpose of the Project

Modern datacenters host tens of thousands of server assets across massive physical spaces. Traditional 2D spreadsheet or table management makes spatial planning, thermal management, and rapid asset troubleshooting difficult. 

**Visual Datacenter** solves this by offering:
- **Sub-Second High-Density Population**: Populate 10,000+ devices across 500+ server racks in sub-second (< 0.5s) time via high-performance `JdbcTemplate` batch processing.
- **Fluid 60 FPS 3D Rendering**: GPU-instanced rendering (`InstancedMesh`) allowing full 3D hall navigation without performance degradation.
- **Asset Telemetry & Health Monitoring**: Integrated SNMP OID telemetry (CPU, RAM, Uptime, Temperature, Network) and Modbus monitoring for UPS power cabinets.
- **Spatial Grid Alignment**: Automatic room sizing and `.5` decimal grid square coordinate alignment for precise rack positioning.

---

## 🚀 Key Features & Abilities

### 🏬 1. Real-Time 3D Digital Twin Hall
- **GPU Instanced Rendering**: Uses Three.js `InstancedMesh` to render hundreds of racks with custom transform matrices and color buffers in a single draw call.
- **Auto-Calculating Room Hall Dimensions**: Sizes room width and length dynamically based on the target rack count and aisle spacing.
- **Infinite Raycasting & Frustum Optimization**: Ensures no meshes vanish during camera rotations while preserving smooth interaction.

### 📊 2. Color-Coded Utilization Heatmaps
Racks display dynamic utilization color bands based on total occupied rack units (U):
- 🟢 **Sage Green (Low < 50%)**: Lightly occupied server racks.
- 🔵 **Vibrant Blue (Medium 50% – 79.9%)**: Moderately occupied server racks.
- 🔴 **Crimson Red (High ≥ 80%)**: Highly populated or full server racks (42U/44U).

### 🔍 3. Rack Isolation & Spotlight Mode
- Drag-select a region of racks to isolate them.
- Non-selected racks smoothly flatten (`scaleY = 0.01`), while isolated racks elevate (`scaleY = 1.0`).
- Selecting an individual rack focuses the 3D camera and pops down surrounding instances to highlight the active asset.

### 🖥️ 4. Detailed 2D/3D Asset Inspection
- **3D X-Ray Mode**: Inspect translucent rack structures, corner pillars, edge outlines, and vertical PDUs (Left/Right/Rear).
- **Interactive 2D Sidebar**: View exact U-slot positions, front/rear faceplate renders, installed modular expansion bays, console ports, power ports, and IP configurations.

### 🔎 5. Fast Search (PostgreSQL GIN Trigram Index)
- Search across racks, device names, IP addresses, or device models.
- Matching racks instantly highlight in bright ocean blue (`#0284c7`) in the 3D scene.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Java 21, Spring Boot 3.4 / 4.1
- **Database Access**: Spring Data JPA & `JdbcTemplate` (raw SQL batch updating for sub-second database operations)
- **Database**: PostgreSQL (with GIN trigram indexing) / H2 (testing)
- **Testing & Coverage**: JUnit 5, Mockito, JaCoCo Coverage Enforcement

### Frontend
- **Core**: React 19, Vite, TypeScript
- **3D Graphics**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **State & API**: Zustand, Axios
- **Styling**: Vanilla CSS Design System, Tailwind CSS, Lucide Icons

---

## ⚙️ Getting Started & How to Run

### Prerequisites
- **Docker & Docker Compose** installed

---

### Running with Docker Compose

To build and launch the full containerized stack:

```bash
docker-compose up --build
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3000`

### Database Seeding via API

To seed 10,000+ devices into a single main datacenter hall using the high-speed `JdbcTemplate` batch pipeline (~500ms execution time), run the following `curl` command:

```bash
curl -X POST "http://localhost:3000/api/v1/seed?count=10000"
```

---

## 🧪 Running Tests & Verification

### Backend Tests (JUnit 5 + JaCoCo Coverage)
```bash
cd backend
./gradlew test jacocoTestCoverageVerification
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
