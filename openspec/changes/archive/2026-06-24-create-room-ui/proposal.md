## Why

The Room List page currently shows existing rooms but provides no way to create new ones from the frontend. Users must use external tools (Postman, curl) to hit the backend API. Adding a Create Room UI closes the loop so the app is self-sufficient for basic room management.

## What Changes

- Add a "+ New Room" button on the `RoomListPage` header
- Introduce a modal dialog component for the room creation form
- Form fields: `name` (required), `location` (optional), `widthM` (required), `depthM` (required), `heightM` (optional)
- Client-side validation using **Zod** schema and **React Hook Form** matching the backend `CreateRoomDTO` constraints
- On successful creation, room list refreshes and modal closes
- On validation error (e.g. duplicate name → 409), display the error in the modal
- Add a `createRoom()` action to the existing `useRoomStore` utilizing an **Axios** wrapper with configured environment base URL

## Capabilities

### New Capabilities
- `create-room-form`: Modal dialog with form fields, client-side validation via Zod and React Hook Form, API submission to `POST /rooms` (relative to API base URL), and error handling

### Modified Capabilities
- `room-list-page`: Adding a "+ New Room" trigger button to the page header that opens the create modal

## Impact

- **Frontend files changed**: `src/pages/RoomListPage/RoomListPage.tsx`, `src/stores/useRoomStore.ts`, new modal component under `src/components/`, Axios wrapper in `lib/api.ts`
- **Backend API consumed**: `POST /rooms` relative to `VITE_API_URL` (already implemented)
- **No backend changes** required
- **New npm dependencies** required: `react-hook-form`, `zod`, `@hookform/resolvers`, `axios`
