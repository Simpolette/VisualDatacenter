## 1. 3D Standalone UPS Cabinet & Telemetry Inspector UI

- [x] 1.1 Create `UpsCabinet3D.tsx` in `frontend/src/components/RoomDetails/` rendering a 3D floor-standing UPS power cabinet with LED indicators and battery screen
- [x] 1.2 Create `UpsTelemetryOverlay.tsx` floating inspector panel to view live Modbus metrics (`BATTERY_LEVEL`, `INPUT_VOLTAGE`, `OUTPUT_VOLTAGE`, `UPS_LOAD`, `TEMPERATURE`)
- [x] 1.3 Integrate `UpsCabinet3D` and `UpsTelemetryOverlay` into `RoomScene3D.tsx` and `RoomDetailsPage.tsx`

## 2. Verification

- [x] 2.1 Run `npx tsc --noEmit` and confirm zero TypeScript errors
