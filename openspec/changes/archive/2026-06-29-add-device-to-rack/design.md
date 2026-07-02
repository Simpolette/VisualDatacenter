## Context

The Visual Datacenter application currently has a fully functional backend for device CRUD operations — `POST /api/v1/racks/:rackId/devices` (install), `PUT /api/v1/devices/:id` (update), and `DELETE /api/v1/devices/:id` (remove) — with server-side U-slot collision detection via `SlotValidator`. The `GET /api/v1/device-types` endpoint provides the catalog of available device templates.

On the frontend, the `RackSidebar2D` component already renders a read-only U-slot grid showing installed devices, but there is no UI to install new devices or delete existing ones. The rack store (`useRackStore.ts`) manages rack CRUD and detail fetching but has no device operation methods.

The frontend uses: React + Vite, Zustand for state management, `react-hook-form` + `zod` for form validation (established in `CreateRoomForm`), and an `api` Axios instance from `lib/api.ts`.

## Goals / Non-Goals

**Goals:**
- Allow users to install a device into a rack from the Rack Inspector sidebar
- Allow users to delete a device from the sidebar's device list
- Provide a device type selector populated from the backend catalog
- Show visual feedback on slot availability in the U-slot grid
- Refresh rack details (stats, slot grid, device list) after install/delete operations
- Match the existing dark, premium design language of the application

**Non-Goals:**
- Device update/edit UI (move, rename, change status) — future change
- Drag-and-drop device placement in the 2D grid — future enhancement
- Device type CRUD management UI — out of scope
- 3D visualization of individual devices within rack meshes — future change
- PDU installation UI — separate change

## Decisions

### 1. Extend `useRackStore` instead of creating a separate device store

**Decision**: Add `installDevice()`, `deleteDevice()`, and `fetchDeviceTypes()` actions directly to `useRackStore.ts`.

**Rationale**: Device operations are tightly coupled to rack context — installing a device requires `rackId`, and both install and delete must trigger a rack details refresh. A separate `useDeviceStore` would create cross-store synchronization complexity. Since the device type list is only needed within the rack sidebar context, colocating it avoids unnecessary state fragmentation.

**Alternative considered**: Separate `useDeviceStore` — rejected because it would need to call `useRackStore.fetchRackDetails()` after every mutation, creating tight coupling between stores without the benefit of separation.

### 2. Inline install form within the sidebar (accordion/expandable section)

**Decision**: Render the Install Device form as an expandable section at the top of `RackSidebar2D`, toggled by an "Add Device" button. Not a separate modal or page.

**Rationale**: Users need to see the U-slot grid while filling the form to pick the right startU position. An inline form preserves context. The existing `RightSidebar` component already supports scrollable content, so adding a collapsible form section fits naturally.

**Alternative considered**: Modal dialog — rejected because it obscures the slot grid which is essential for choosing startU. Separate sidebar mode (like `CreateRackSidebar2D`) — considered but overly complex for a simple 4-field form.

### 3. Use `react-hook-form` + `zod` for the install form

**Decision**: Follow the established pattern from `CreateRoomForm` — define a Zod schema for client-side validation, use `react-hook-form` with `@hookform/resolvers/zod`.

**Rationale**: Consistency with the existing codebase. Zod provides type-safe validation (deviceTypeId required, startU ≥ 1, face enum), and react-hook-form minimizes re-renders.

### 4. Click-to-delete with inline confirmation

**Decision**: Each device in the sidebar list gets a small trash icon button. Clicking it shows an inline "Confirm delete?" prompt (not a modal). Confirming sends `DELETE /api/v1/devices/:id` and refreshes rack details.

**Rationale**: Devices in a datacenter simulation are easily re-created, so a lightweight inline confirmation is sufficient — no need for a full modal dialog. This keeps the interaction fast.

### 5. Server-side validation as source of truth for slot conflicts

**Decision**: The frontend performs basic client-side validation (required fields, startU ≥ 1) but relies on the backend's `SlotValidator` for collision detection. Slot conflict errors (409) are displayed as form-level error messages.

**Rationale**: Duplicating the collision algorithm on the frontend would be fragile and hard to keep in sync. The backend already returns clear error messages for conflicts. Client-side validation handles only what's unambiguous (required fields, value ranges).

## Risks / Trade-offs

- **[Risk]** Device type list could be empty if no device types exist → Display an inline message "No device types found. Create device types first." and disable the install form.
- **[Risk]** Server error messages from 409 conflicts may not be user-friendly → Parse error response and display a readable "Slots X–Y are already occupied" message.
- **[Trade-off]** No drag-and-drop slot picking → Users must manually type `startU`. This is simpler to implement but less intuitive. Acceptable for MVP; drag-to-slot interaction can be added later.
- **[Trade-off]** Inline form adds vertical length to the sidebar → Mitigated by making the form collapsible (hidden by default).
