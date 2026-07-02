## 1. Reusable Modal Component

- [x] 1.1 Create `src/components/Modal/Modal.tsx` — renders children inside a React `createPortal` to `document.body`; includes backdrop overlay, centered panel, close button (×), and Escape key handler; styled with Tailwind utility classes
- [x] 1.2 Add props: `isOpen` (boolean), `onClose` (callback), `title` (string), `children` (ReactNode)

## 2. Store: createRoom Action

- [x] 2.1 Add `createRoom(data: CreateRoomPayload)` async action to `useRoomStore` — POSTs to `/api/v1/rooms`, on success calls `fetchRooms()` and returns the created room
- [x] 2.2 Add `creating` (boolean) and `createError` (string | null) state fields to the store for tracking submission state
- [x] 2.3 Define a `CreateRoomPayload` interface matching the backend DTO: `{ name: string; location?: string; widthM: number; depthM: number; heightM?: number }`

## 3. Create Room Form

- [x] 3.1 Create `src/components/CreateRoomForm/CreateRoomForm.tsx` — form with fields: name (text input, required), location (text input, optional), widthM (number input, required), depthM (number input, required), heightM (number input, optional); styled entirely with Tailwind utility classes
- [x] 3.2 Implement client-side validation on submit: name must not be blank, widthM and depthM must be positive numbers; display inline error messages below invalid fields
- [x] 3.3 Wire form submission to `useRoomStore.createRoom()`; on success, call an `onSuccess` prop callback; on error, display the server error message in the form
- [x] 3.4 Disable the "Create" submit button and show a loading indicator while `creating` is true
- [x] 3.5 Style form action buttons: Create uses `bg-primary` with hover state, Cancel uses ghost/outline style — all via Tailwind utilities

## 4. Room List Page Integration

- [x] 4.1 Add a "+ New Room" button to the `RoomListPage` header, styled with `bg-primary` Tailwind classes
- [x] 4.2 Add `useState<boolean>` for modal open/close state in `RoomListPage`
- [x] 4.3 Render `<Modal>` wrapping `<CreateRoomForm>` when the modal is open; wire `onClose` and `onSuccess` to close the modal
