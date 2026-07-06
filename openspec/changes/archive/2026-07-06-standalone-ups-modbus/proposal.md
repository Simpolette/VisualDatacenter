## Why

Datacenter operators require a visual representation of room-level Uninterruptible Power Supply (UPS) units to monitor power feeds flowing into rack PDUs. Adding a standalone floor UPS cabinet in the 3D scene linked with live Modbus telemetry (battery level, input/output voltage, load %, temperature) bridges the gap between physical power hardware and real-time Modbus telemetry monitoring.

## What Changes

- **3D Standalone Floor UPS Cabinet Component (`UpsCabinet3D.tsx`)**:
  - Render a standalone 3D UPS power cabinet on the room floor with LED status indicators, digital battery gauge screens, and metallic heat dissipation grills.
- **Interactive Modbus Telemetry Card (`UpsTelemetryOverlay.tsx`)**:
  - Clicking the UPS cabinet opens an inspector overlay displaying live Modbus metrics streamed via WebSocket (Battery level %, Input/Output Voltage, UPS Load %, Temperature °C).
- **Scene Integration (`RoomScene3D.tsx`)**:
  - Place `UpsCabinet3D` in the 3D scene room grid.

## Capabilities

### New Capabilities
- `standalone-ups-modbus`: Standalone 3D floor UPS cabinet rendering and interactive Modbus telemetry inspection overlay.

### Modified Capabilities
- None.

## Impact

- **Frontend**:
  - `src/components/RoomDetails/UpsCabinet3D.tsx`: New 3D UPS cabinet component.
  - `src/components/RoomDetails/UpsTelemetryOverlay.tsx`: New Modbus telemetry inspection panel.
  - `src/pages/RoomDetailsPage/RoomScene3D.tsx`: Render `UpsCabinet3D` and telemetry overlay in scene.
