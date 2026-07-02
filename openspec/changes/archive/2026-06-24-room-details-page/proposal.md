## Why

Currently, the Datacenter Infrastructure Management application displays a list of rooms, but users cannot view the contents of a specific room. To provide a functional MVP, users need a page to visualize the layout of racks in a 3D floor plan and manage the devices installed within individual racks.

## What Changes

- Add a new `RoomDetails` page that provides a 3D simulation of a room's racks on a floor plan, featuring smooth camera animations to focus on selected racks, and a 2D rack editor sidebar panel.
- Install `@react-three/fiber` (v9+) and `@react-three/drei` (v10+) for rendering the 3D canvas and controls in React 19.
- Install `lucide-react` for standard UI dashboard iconography.
- Register a route for the room details page `/rooms/:id` in `App.tsx`.
- Update the `RoomCard` component to navigate to `/rooms/:id` when clicked.

## Capabilities

### New Capabilities
- `room-details-page`: A new capability encompassing the room details page, including the 3D room floor plan showing rack placements and occupancy, smooth camera animations that focus and rotate the viewport to a face-on angle of the clicked rack, and a 2D slide-out sidebar for managing rack slots and device allocations.

### Modified Capabilities
- `room-list-page`: Update the Room List page requirements to ensure clicking a room card navigates the user to the corresponding room details page.

## Impact

- **Frontend Routing**: Add route `/rooms/:id` in `App.tsx` mapped to the new page.
- **Frontend Components**: Create page and subcomponents under `src/pages/RoomDetailsPage/`.
- **Frontend Stores**: Create/update stores (or extend existing stores) to fetch racks and devices.
- **Frontend Dependencies**: Add `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, and `lucide-react` to `package.json`.
- **Existing Page**: Modify `RoomCard.tsx` in `src/components/RoomCard/RoomCard.tsx` to handle navigation.
