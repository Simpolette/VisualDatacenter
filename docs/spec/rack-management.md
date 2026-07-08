# Rack Management Specification

## 1. Description
Enables creating, positioning, sizing, updating, and deleting server racks within datacenter rooms. Racks are configured with standard heights (42U or 44U) and positioned in the 3D room canvas using click-and-drag grid snapping relative to the room floor origin.

---

## 2. Main Flow
1.  **Enter Room Details**: The user navigates to `/rooms/:id` to load the 3D room visualization.
2.  **Add Rack Gesture**: The user clicks down on a room floor grid cell in placement mode. A semi-transparent "ghost rack" appears.
3.  **Position and Rotate**: The user drags the mouse in a direction. The system locks the start coordinate `(posX, posY)`, snaps coordinates to 1.0m increments, aligns orientation `rotationDeg` to 90-degree steps matching the drag vector, and dynamically adjusts the rack length (up to 4.0m).
4.  **Confirm Position**: The user releases the mouse. The coordinates and rotation lock, opening the configuration form in the RightSidebar.
5.  **Configure & Submit**: The user chooses the total units (42U or 44U) and submits.
6.  **API Call**: The frontend sends a `CreateRackDTO` to `POST /api/v1/rooms/{roomId}/racks`.
7.  **Render**: Upon receiving HTTP 201 Created, the active workspace adds the new rack model to the 3D scene and selects it.

---

## 3. Access Control
*   **Authorization Level**: Single-user sandbox model.
*   **Policy**: No authentication or role checks. Full read, write, update, and delete privileges are available to all API clients.

---

## 4. Data Model

### CreateRackDTO / UpdateRackDTO
*   `name` (String, Required)
*   `totalUnits` (Integer, Required - must be 42 or 44)
*   `posX` (Float, Required)
*   `posY` (Float, Required)
*   `rotationDeg` (Float, Optional - defaults to 0)
*   `length` (Float, Optional - defaults to 1.0)

### RackDetailDTO
*   `id` (Long)
*   `roomId` (Long)
*   `name` (String)
*   `totalUnits` (Integer)
*   `posX` (Float)
*   `posY` (Float)
*   `rotationDeg` (Float)
*   `length` (Float)
*   `devices` (List of Device objects)
*   `pdus` (List of PDU objects)
*   `freeUnits` (Integer)
*   `occupiedUnits` (Integer)

---

## 5. Error Scenarios

| Trigger | Condition | Expected System Behavior |
| :--- | :--- | :--- |
| **Rack Creation / Update** | Name already exists in the same room | Backend aborts transaction and returns `HTTP 409 Conflict`. Frontend displays error message in the creation sidebar. |
| **Rack Creation / Update** | `totalUnits` not in {42, 44} | Backend returns `HTTP 400 Bad Request` with field validation details. |
| **Rack Placement** | Coordinates fall outside the room's width/length limits | Snapping logic restricts the ghost model. If bypassed, backend returns `HTTP 400 Bad Request`. |
| **Inspection / Update** | Requesting rack ID that does not exist | Backend returns `HTTP 404 Not Found`. |

---

## 6. Constraints
*   **Name Scope**: Rack names must be unique within a single room.
*   **Standardized Heights**: Height units are restricted strictly to `42` or `44` units.
*   **Grid Snap**: Placement positions (`posX`, `posY`) and lengths must snap to 1.0m boundaries aligned with the bottom-left room origin.
*   **Cascade Deletion**: Deleting a rack must cascade-delete all devices and PDUs mounted inside it.

---

## 7. Acceptance Criteria
*   The 3D floor grid coordinates align with the room boundary, setting the bottom-left corner of the room floor as origin (0, 0, 0) without fractional or misaligned offsets.
*   Pressing mouse-down and dragging over the grid snaps position to 1.0m increments and snaps rotation angles to 90-degree steps.
*   RightSidebar form validates that names are provided and total units selection is restricted to 42U and 44U.
*   Duplicate rack names within the same room trigger a `409 Conflict` error and show an inline error message in the form sidebar.
*   Deleting a rack removes all associated devices and PDUs from the database.
