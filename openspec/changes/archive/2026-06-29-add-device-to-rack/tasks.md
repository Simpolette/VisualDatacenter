## 1. Extend Rack Store with Device Operations

- [x] 1.1 Add `DeviceType` interface and `deviceTypes` state to `useRackStore.ts` with a `fetchDeviceTypes()` action that calls `GET /api/v1/device-types`
- [x] 1.2 Add `installDevice(rackId, dto)` action to `useRackStore.ts` that calls `POST /api/v1/racks/{rackId}/devices` and re-fetches rack details on success
- [x] 1.3 Add `deleteDevice(deviceId, rackId)` action to `useRackStore.ts` that calls `DELETE /api/v1/devices/{deviceId}` and re-fetches rack details on success

## 2. Install Device Form Component

- [x] 2.1 Create `InstallDeviceForm.tsx` component in `frontend/src/pages/RoomDetailsPage/` with a Zod validation schema (`deviceTypeId` required, `startU` ≥ 1, `face` defaults to FRONT, `name` optional string) and `react-hook-form` integration
- [x] 2.2 Implement the device type dropdown in the form — fetch device types on mount, display as "{name} ({category}, {heightU}U)", handle empty catalog and fetch error states
- [x] 2.3 Implement auto-generated device name — when a device type is selected, populate the name field with "{deviceTypeName} #{count + 1}" based on existing devices of that type in the rack
- [x] 2.4 Implement form submission — call `installDevice()`, display server-side error messages (409 slot conflict, 400 bounds error) as form-level errors, collapse form on success

## 3. Integrate Install Form into Rack Sidebar

- [x] 3.1 Add "Add Device" button to the `RackSidebar2D` header/stats area that toggles a `showInstallForm` state
- [x] 3.2 Render `InstallDeviceForm` as a collapsible section at the top of the sidebar content when `showInstallForm` is true, passing `rackId` and rack details as props
- [x] 3.3 Ensure the install form collapses and resets when the sidebar closes or a different rack is selected

## 4. Device Delete Actions on Sidebar

- [x] 4.1 Add a hover-revealed trash icon button to each device card in the `RackSidebar2D` U-slot grid overlay
- [x] 4.2 Implement inline delete confirmation — clicking trash replaces the device card content with "Delete {name}?" and Confirm/Cancel buttons
- [x] 4.3 Wire the Confirm button to call `deleteDevice(deviceId, rackId)` and handle success (auto-refresh) and error (show error message, restore card) states

## 5. Polish and Edge Cases

- [x] 5.1 Style the Install Device form to match the existing dark premium design language (slate/primary colors, border styles, rounded corners)
- [x] 5.2 Add loading states to the install form submit button and delete confirmation button (spinner + disabled state during API calls)
- [x] 5.3 Ensure the sidebar scroll position is preserved/reset appropriately when the install form expands or a device is deleted
