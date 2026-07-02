## Why

The backend API for installing, updating, and deleting devices in a rack is fully implemented (POST/PUT/DELETE under `/api/v1/racks/:rackId/devices`), including U-slot collision detection and validation. However, there is no frontend UI for users to actually install devices into racks. Users currently have no way to add, view, or manage devices through the application interface — the Rack Inspector sidebar shows existing devices but provides no "Add Device" workflow. This is the next critical step to make the datacenter simulation usable.

## What Changes

- Add an **"Install Device" form** accessible from the Rack Inspector sidebar that lets users select a device type, choose a U-slot position and face, provide a name, and submit the installation
- Create a **device type catalog fetch** mechanism so the form can display available device types from `GET /api/v1/device-types`
- Implement **visual slot availability feedback** in the U-slot grid — users should be able to see which slots are free and which are occupied before choosing a position
- Add **device deletion** capability from the sidebar — users should be able to remove an installed device directly from the rack view
- **Refresh rack details** after install/delete operations so the U-slot grid and stats update in real-time
- Add a **Zustand store for device operations** (install, delete) and device type fetching to keep state management consistent with existing patterns

## Capabilities

### New Capabilities
- `install-device-ui`: Frontend form and interaction for installing a device into a rack via the Rack Inspector sidebar, including device type selection, slot picking, and form validation
- `delete-device-ui`: Frontend interaction for removing an installed device from a rack via the sidebar

### Modified Capabilities
- `room-details-page`: The Rack Inspector sidebar (`RackSidebar2D`) gains an "Add Device" button and per-device delete actions, extending its current read-only device list

## Impact

- **Frontend components**: `RackSidebar2D.tsx` will be extended with add/delete device UI; a new `InstallDeviceForm` component will be created
- **Frontend stores**: A new `useDeviceStore.ts` (or extension of `useRackStore.ts`) will handle device type listing and device install/delete API calls
- **Backend**: No backend changes required — all APIs (`POST /api/v1/racks/:rackId/devices`, `DELETE /api/v1/devices/:id`, `GET /api/v1/device-types`) already exist
- **API dependencies**: `GET /api/v1/device-types` (list catalog), `POST /api/v1/racks/:rackId/devices` (install), `DELETE /api/v1/devices/:id` (remove)
