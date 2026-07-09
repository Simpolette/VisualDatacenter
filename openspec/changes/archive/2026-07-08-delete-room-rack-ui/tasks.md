## 1. Frontend Store Extensions

- [x] 1.1 Add `deleteRoom(roomId: number)` to `useRoomStore.ts` that issues `DELETE /rooms/{id}` and updates the local rooms array.
- [x] 1.2 Add `deleteRack(roomId: number, rackId: number)` to `useRackStore.ts` that issues `DELETE /racks/{id}`, re-fetches racks for the room, and clears the selected rack.

## 2. Room Deletion UI

- [x] 2.1 Add a delete trash button to `RoomCard.tsx` positioned in the top-right corner. It should be visible when hovering the card.
- [x] 2.2 Implement a confirmation modal inside `RoomCard.tsx` to prevent accidental deletion and handle the delete execution.
- [x] 2.3 Add a red outline "Delete Room" button in `RoomDetailsHeader.tsx` next to the room metadata.
- [x] 2.4 Implement a confirmation modal in `RoomDetailsHeader.tsx`. Upon successful deletion, redirect the user back to `/rooms` using `useNavigate`.

## 3. Rack Deletion UI

- [x] 3.1 Modify `RackSidebar2D.tsx` to add a red "Delete Rack" button at the bottom of the main inspector view (visible when no device is selected).
- [x] 3.2 Implement an inline confirmation card at the bottom of `RackSidebar2D.tsx` that replaces/displays near the delete button when clicked.
- [x] 3.3 Ensure the inline confirmation warns that all devices and PDUs in the rack will be deleted.
- [x] 3.4 Hook the confirmation action to `deleteRack(roomId, rackId)`, close the sidebar on success, and reset any active selection.
