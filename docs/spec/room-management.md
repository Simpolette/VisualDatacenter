# Room Management Specification

## 1. Description
Provides functional capabilities to create, list, inspect details of, update, and delete server rooms (datacenters) in the system. The frontend displays these rooms as cards on a dashboard, while the backend serves REST APIs and handles relational consistency.

---

## 2. Main Flow
1.  **View Room List**: The user opens the application and lands on the Room List page (`/rooms`). The system calls `GET /api/v1/rooms` to retrieve room records.
2.  **Trigger Creation**: The user clicks the "+ New Room" button.
3.  **Form Input**: A modal pops up. The user inputs Name, Width (meters), Length (meters), and optional Location.
4.  **Client-Side Validation**: The frontend validates inputs using `react-hook-form` and a Zod schema.
5.  **Submission**: The frontend posts a `CreateRoomDTO` payload to `POST /api/v1/rooms`.
6.  **Persistence**: The backend verifies constraints, saves the `Room` entity to PostgreSQL, and returns HTTP 201 Created with the room record.
7.  **Refresh & Navigation**: The modal closes, the room list store updates, and the new room card appears on the grid. Clicking it navigates to `/rooms/:id`.

---

## 3. Access Control
*   **Authorization Level**: Single-user sandbox model. 
*   **Policy**: No authentication or role verification. Full read, write, update, and delete privileges are granted to all API client requests.

---

## 4. Data Model

### CreateRoomDTO / UpdateRoomDTO
*   `name` (String, Required)
*   `location` (String, Optional)
*   `widthM` (Float, Required)
*   `lengthM` (Float, Required)
*   `heightM` (Float, Optional)

### RoomDetailDTO
*   `id` (Long)
*   `name` (String)
*   `location` (String)
*   `widthM` (Float)
*   `lengthM` (Float)
*   `heightM` (Float)
*   `racks` (List of Rack objects)
*   `rackCount` (Integer)
*   `totalCapacityU` (Integer)
*   `usedU` (Integer)
*   `createdAt` (Timestamp)
*   `updatedAt` (Timestamp)

---

## 5. Error Scenarios

| Trigger | Condition | Expected System Behavior |
| :--- | :--- | :--- |
| **Room Creation / Update** | Name already exists in system database | Backend aborts transaction and returns `HTTP 409 Conflict`. Frontend displays "Room name already exists" banner inside the modal. |
| **Room Creation / Update** | `widthM <= 0` or `lengthM <= 0` | Zod blocks submit (frontend). If bypassed, backend returns `HTTP 400 Bad Request` with field validation errors. |
| **Inspection / Update** | Requesting room ID that does not exist | Backend returns `HTTP 404 Not Found`. Frontend routes back to list and displays a notification. |

---

## 6. Constraints
*   **Uniqueness**: The room `name` field must be unique system-wide.
*   **Physical Bounds**: Room dimensions (`widthM`, `lengthM`) must be positive numbers.
*   **Referential Cascade**: Deleting a room must cascade-delete all child racks, device placements, and attached PDUs.

---

## 7. Acceptance Criteria
*   The Room List grid renders a card for each room showing its name and dimension as "width × length" (e.g., `10.0m × 8.0m`).
*   Form inputs block submission and display error messages if required fields are missing or numbers are <= 0.
*   Duplicate room names are rejected by the backend with `409 Conflict`, and the UI displays the server's error message gracefully.
*   Executing a room deletion cascadingly cleanses all associated racks, devices, and PDUs from the database.
