## Context

Currently, the application allows creating rooms and placing racks, but lacks any capability to delete rooms or racks from the user interface. This design outlines the frontend components and state actions required to implement room and rack deletion, ensuring safe confirmation steps and capitalizing on the backend's existing cascading delete capabilities.

## Goals / Non-Goals

**Goals:**
- Add `DELETE` API integration in frontend stores.
- Create user-friendly, high-risk warnings (modal/inline) that explain the cascading delete behavior.
- Cleanly cascade delete rooms (including all racks, devices, and PDUs).
- Cleanly cascade delete racks (including all devices, modules, ports, and PDUs).
- Smoothly update frontend state and viewport immediately after deletion.

**Non-Goals:**
- Implementing soft deletes or archive/restore features (this is a sandbox MVP environment).
- Modifying the backend DB schema or adding manual deletion loops in the backend (the JPA cascading annotations already satisfy this).

## Decisions

### 1. Leverage Existing Backend Cascading Deletion
- **Choice:** Rely on Spring Boot's JPA `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` mappings.
- **Rationale:** The backend entities already cascade deletions down the chain (`Room` -> `Rack` -> `Device`/`Pdu` -> `Interfaces`/etc.). Running a single SQL `DELETE` query through JPA will delete all children, preventing foreign key constraint violations.
- **Verification:**
  - `Room.java` cascades to `Rack`
  - `Rack.java` cascades to `Device` and `Pdu`
  - `Device.java` cascades to physical components and modules
  - This guarantees that deleting a rack deletes all devices first.

### 2. High-Risk Confirmation UI
- **Choice:**
  - **Room Deletion**: Use a modal confirmation dialog because deleting a room is a major, irreversible action that clears the layout.
  - **Rack Deletion**: Use an inline confirmation section in the `RackSidebar2D` (similar to adding/deleting PDUs/devices) to keep the sidebar-first interaction model clean and avoid disruptive modal popups.
- **Rationale:** Matches current UI patterns in the application, offering low friction while ensuring safety.

### 3. Navigation and Viewport Reset
- **Choice:**
  - Upon Room deletion, redirect the client to `/rooms`.
  - Upon Rack deletion, clear `selectedRackId`, close the sidebar, and trigger `fetchRacksForRoom` to immediately refresh the 3D scene.
- **Rationale:** Ensures the UI remains in a valid state and the 3D canvas represents the correct layout immediately.

## Risks / Trade-offs

- **[Risk]** Accidental deletions due to missing confirmations. -> **[Mitigation]** Both room and rack deletion require a two-step confirmation (clicking "Delete" opens a secondary confirmation panel/modal with a clear red button).
- **[Risk]** Telemetry streams might break if a selected rack is deleted while streaming. -> **[Mitigation]** We clear `selectedRackId` in the store, which automatically triggers the unmount effect in `RoomDetailsPage` to close the SSE telemetry stream.
