## Context

The backend service `ModbusPollerService.java` polls Modbus TCP devices for UPS telemetry metrics (`BATTERY_LEVEL`, `INPUT_VOLTAGE`, `OUTPUT_VOLTAGE`, `UPS_LOAD`, `TEMPERATURE`). On the frontend, datacenter rooms currently display server racks but lack a visual representation of the main UPS power cabinet.

## Goals / Non-Goals

**Goals:**
- Build a 3D component `UpsCabinet3D.tsx` to render a wide (1.4m width x 2.0m height x 1.0m depth) floor-standing industrial UPS cabinet in a bright metallic silver finish (`#e2e8f0`) with digital battery gauges, cooling ventilation grills, and active LED status lights.
- Build a `UpsTelemetryOverlay.tsx` right-side drawer sidebar that displays real-time Modbus telemetry metrics when the operator selects the UPS cabinet in 3D.
- Connect `UpsCabinet3D` to the `useTelemetryStore` to display live Modbus metrics.

**Non-Goals:**
- Modifying backend Modbus TCP socket framing or register addresses.

## Decisions

### Decision 1: Dedicated 3D UPS Cabinet Component (`UpsCabinet3D.tsx`)
- **Choice**: Create a standalone 3D component with dimensions `[1.4m width, 2.0m height, 1.0m depth]` in a bright metallic silver finish placed on the room floor (`x = 1.0m, z = 1.0m`).
- **Rationale**: The bright silver finish makes the heavy UPS cabinet easily distinguishable from dark server racks while providing high visual contrast on dark floor tiles.

### Decision 2: Right-Side Sidebar Drawer for Modbus Telemetry
- **Choice**: Retrieve metrics for `deviceId = 999` from `useTelemetryStore` to populate the `UpsTelemetryOverlay` right-side sidebar with real-time Modbus data, battery percentage gauge, active alarms, and connected rack PDU feeds.

## Risks / Trade-offs

- **[Risk] Room Boundary Collision** → *Mitigation*: Dynamically calculate UPS placement coordinates based on `room.width` and `room.length`.
