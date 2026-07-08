## Why

Currently, the application allows creating rooms and placing racks, but lacks any capability to delete rooms or racks from the user interface. If a user makes a mistake in room setup or rack configuration, they have to reset the database or edit SQL directly. Furthermore, we need to guarantee that deleting a rack cascade-deletes all of its installed devices and PDUs to avoid foreign key constraint violations and orphaned records.

## What Changes

- **Store Actions**:
  - Extend `useRoomStore.ts` with a `deleteRoom(roomId: number)` action to hit `DELETE /api/v1/rooms/{id}`.
  - Extend `useRackStore.ts` with a `deleteRack(roomId: number, rackId: number)` action to hit `DELETE /api/v1/racks/{id}`.
- **Room List Card**:
  - Add a delete (Trash) icon button to `RoomCard.tsx` that appears on hover.
  - Trigger a confirmation modal when the delete button is clicked.
- **Room Details Page**:
  - Add a "Delete Room" button to `RoomDetailsHeader.tsx` next to the room name.
  - Trigger a confirmation modal that, upon success, redirects the user back to the Room List page (`/rooms`).
- **Rack Inspector**:
  - Add a "Delete Rack" section at the bottom of `RackSidebar2D.tsx`.
  - Implement an inline confirmation warning showing that all installed devices and PDUs will be permanently deleted.
  - Upon success, clear the selection and re-fetch the room's racks to update the 3D scene and stats overlays.

## Capabilities

### New Capabilities
- `delete-room-ui`: Ability to delete rooms from both the Room List page and the Room Details page, prompting the user with a confirmation modal detailing the cascading effects.
- `delete-rack-ui`: Ability to delete racks from the Rack Inspector sidebar, showing an inline confirmation warning.

### Modified Capabilities
- `room-crud`: The backend already supports deleting rooms via `DELETE /api/v1/rooms/{id}` which cascade-deletes associated racks, devices, and PDUs.
- `rack-crud`: The backend already supports deleting racks via `DELETE /api/v1/racks/{id}` which cascade-deletes associated devices and PDUs.

## Impact

- **Frontend Stores**:
  - `frontend/src/stores/useRoomStore.ts` — add `deleteRoom`.
  - `frontend/src/stores/useRackStore.ts` — add `deleteRack`.
- **Frontend Components & Pages**:
  - `frontend/src/components/RoomCard/RoomCard.tsx` — add delete button and confirmation state.
  - `frontend/src/components/RoomDetails/RoomDetailsHeader.tsx` — add "Delete Room" button and confirmation dialog.
  - `frontend/src/pages/RoomDetailsPage/RackSidebar2D.tsx` — add "Delete Rack" button with inline confirmation.
