# PDU Management Specification

## 1. Description
Provides functional capabilities to attach Power Distribution Units (PDUs) to designated positions (Left, Right, or Rear) on a server rack and detach them. The system prevents placing duplicate PDUs in the same mounting position on a single rack.

---

## 2. Main Flow
1.  **Select Rack**: The user opens the 2D rack inspector sidebar.
2.  **Attach PDU**: The user clicks the PDU attachment button.
3.  **Form Input**: Fills PDU Name, mounting position (`LEFT`, `RIGHT`, or `REAR`), and outletCount.
4.  **Submission**: Sends `CreatePduDTO` payload to `POST /api/v1/racks/:rackId/pdus`.
5.  **Validation**: The backend verifies:
    *   If position is valid.
    *   If that specific mounting position is already occupied on the rack.
6.  **Persistence**: Saves the `Pdu` entity, linking it to the rack. Returns HTTP 201.
7.  **Refresh**: The frontend reloads the rack information and updates the PDU slot/power status display.

---

## 3. Access Control
*   **Authorization Level**: Single-user sandbox model.
*   **Policy**: No authentication or role-based check. Full read and write actions are available to all API client requests.

---

## 4. Data Model

### CreatePduDTO
*   `name` (String, Required)
*   `position` (Enum [LEFT, RIGHT, REAR], Required)
*   `outletCount` (Integer, Required - positive)

### Pdu (Entity Model)
*   `id` (Long)
*   `rackId` (Long)
*   `name` (String)
*   `position` (Enum [LEFT, RIGHT, REAR])
*   `outletCount` (Integer)
*   `createdAt` (Timestamp)
*   `updatedAt` (Timestamp)

---

## 5. Error Scenarios

| Trigger | Condition | Expected System Behavior |
| :--- | :--- | :--- |
| **PDU Attachment** | Mounting position already occupied by another PDU on the rack | Backend aborts transaction, returning `HTTP 409 Conflict`. Frontend displays error message indicating the slot is taken. |
| **PDU Attachment** | Position value is not LEFT, RIGHT, or REAR | Returns `HTTP 400 Bad Request`. |
| **PDU Attachment** | Rack ID does not exist | Returns `HTTP 404 Not Found`. |
| **PDU Detachment** | PDU ID does not exist | Returns `HTTP 404 Not Found`. |

---

## 6. Constraints
*   **Position Uniqueness**: A rack can have at most one PDU per position (`LEFT`, `RIGHT`, `REAR`), limiting total PDUs per rack to 3.
*   **Outlet Range**: Outlet count must be a positive integer.

---

## 7. Acceptance Criteria
*   The system permits attaching a PDU to a vacant position (`LEFT`, `RIGHT`, `REAR`) on a rack, returning HTTP 201.
*   Attempting to attach a PDU to a position that already has a PDU on that rack fails and returns HTTP 409 Conflict.
*   Deleting (detaching) a PDU successfully removes it from the database and returns HTTP 204.
