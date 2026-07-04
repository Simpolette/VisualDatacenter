## Why

Currently, the backend data model and API endpoints support PDU creation and tracking (`LEFT`, `RIGHT`, `REAR` positions), but the frontend lacks both 3D visualization and 2D UI inspector interfaces for PDUs. Datacenter operators need to visualize vertical and rear Power Distribution Units (PDUs) in 3D scene viewports and inspect/manage PDU power attachments in the 2D rack inspector sidebar.

## What Changes

- **3D PDU Rendering (`RackMesh.tsx`)**:
  - Render vertical Zero-U PDU strips (`LEFT` / `RIGHT`) inside the 3D rack enclosure side channels.
  - Render horizontal or vertical rear PDU hardware models (`REAR`) at the back of the rack enclosure.
  - Apply custom metallic/outlet textures and LED indicator glow to PDUs when racks are inspected or X-rayed.
- **2D Rack Inspector PDU Integration (`RackSidebar2D.tsx`)**:
  - Add a PDU management section displaying installed PDUs per rack (`LEFT`, `RIGHT`, `REAR`).
  - Add PDU creation and deletion forms allowing operators to attach up to 2 PDUs per rack.
- **PDU State Management (`useRackStore.ts`)**:
  - Add API actions to create and delete PDUs directly from the 2D sidebar inspector.

## Capabilities

### New Capabilities
- `pdu-ui-visualization`: Visual rendering of 3D PDU hardware strips and interactive 2D PDU management in the rack inspection sidebar.

### Modified Capabilities
- None.

## Impact

- **Frontend**:
  - `src/components/RoomDetails/RackMesh.tsx`: Add 3D PDU geometry meshes and materials.
  - `src/components/RoomDetails/RackPdu3D.tsx`: New sub-component for rendering 3D PDU hardware.
  - `src/pages/RoomDetailsPage/RackSidebar2D.tsx`: Add PDU management section & creation form.
  - `src/stores/useRackStore.ts`: Add `createPdu` and `deletePdu` store actions.
- **Backend API**:
  - Existing `/api/v1/racks/{rackId}/pdus` REST APIs.
