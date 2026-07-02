## Context

The frontend app shell and Room List page are implemented. Users can view existing rooms but cannot create new ones from the UI. The backend room creation endpoint validates via `CreateRoomDTO` (name: required, location: optional, widthM: required positive, depthM: required positive, heightM: optional). The backend returns `409` for duplicate room names and `400` for validation failures.

## Goals / Non-Goals

**Goals:**
- Allow users to create rooms entirely from the frontend
- Validate form inputs client-side before submission
- Handle server-side errors (duplicate name, validation) gracefully in the UI
- Refresh the room list after successful creation

**Non-Goals:**
- Room edit or delete functionality (future change)
- Drag-and-drop room positioning or floor-plan assignment
- File upload for `floorPlanImage` (deferred)

## Decisions

### D1: Modal dialog over inline form or separate page
**Decision**: Use a modal dialog overlay for the creation form, triggered by a button on the Room List page header.  
**Rationale**: Keeps the user in context — they see the room list behind the modal and don't lose their place. A separate `/rooms/new` page would require additional routing and feels heavyweight for a 5-field form.  
**Alternative considered**: Inline expandable form on the page — rejected because it shifts content below and feels jarring in a card grid layout.

### D2: Custom modal component, no external library
**Decision**: Build a reusable `Modal` component (backdrop + centered panel + close button) using React portal (`createPortal`).  
**Rationale**: Zero added dependencies for UI behavior. Portals ensure the modal renders above the sidebar and main content. The component is reusable for future CRUD modals (racks, devices).  
**Alternative considered**: Headless UI libraries (Radix, Headless UI) — rejected for MVP; adds a dependency for minimal gain when we only need one modal pattern.

### D3: React Hook Form and Zod for form state and validation
**Decision**: Use `react-hook-form` coupled with `zod` schema validation (via `@hookform/resolvers/zod`) to manage form state and validation.  
**Rationale**: Integrates type-safe schema validation on the client side that closely matches the backend DTO validation requirements. React Hook Form reduces unnecessary re-renders and handles error state, field registration, and submission state out of the box.  
**Alternative considered**: Local `useState` hook validation — rejected; although simpler for small forms, standardizing on Zod schemas creates a highly extensible pattern for more complex forms down the road.

### D4: createRoom action added to existing useRoomStore
**Decision**: Add a `createRoom(data)` async action to `useRoomStore` that calls `api.post('/rooms', data)` and calls `fetchRooms()` on success.  
**Rationale**: Keeps room-related mutations co-located with queries. The store already manages `rooms[]`, `loading`, and `error`.

### D5: Axios client wrapper with environment base URL
**Decision**: Implement a centralized Axios client instance in `lib/api.ts` with base URL configured via `import.meta.env.VITE_API_URL` and a response interceptor to normalize error handling.  
**Rationale**: Avoids hardcoding HTTP methods, base URLs, or header setups inside the individual Zustand stores. The response interceptor parses backend error DTOs and throws a consistent JS `Error` object containing the backend's validation/conflict messages, simplifying error display in components.

## Risks / Trade-offs

- **Modal accessibility** → Minimal keyboard/screen-reader support in MVP. Focus trapping and `aria-modal` can be layered on later.
- **No optimistic updates** → After creation, we refetch the full list. Acceptable for MVP since room creation is infrequent.
- **Client-side validation may drift from server** → Mitigated by using a shared schema definition matching backend rules, and having the Axios interceptor bubble up database constraint validation errors.
