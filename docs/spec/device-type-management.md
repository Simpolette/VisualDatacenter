# Device Type Management Specification

## 1. Description
Provides capabilities to manage the catalog of device templates (Device Types) which define the physical parameters (U-height, width/length in millimeters, weight, category, and bezel image) of hardware units.

---

## 2. Main Flow
1.  **Request Catalog**: The frontend calls `GET /api/v1/device-types` to retrieve templates for dropdown selections or catalog lists.
2.  **Add Template**: The administrator triggers creation.
3.  **Form Input**: Fills Name, Category, heightU, widthMm, lengthMm, weightKg, and optional imagePath.
4.  **Submission**: Sends `CreateDeviceTypeDTO` to `POST /api/v1/device-types`.
5.  **Validation**: The backend checks:
    *   If name is blank.
    *   If physical dimensions are positive.
    *   If heightU is at least 1.
6.  **Persistence**: Saves the template record to the database, returning HTTP 201.

---

## 3. Access Control
*   **Authorization Level**: Single-user sandbox model.
*   **Policy**: No authentication or role-based check. Full read, write, update, and delete actions are available to all API client requests.

---

## 4. Data Model

### CreateDeviceTypeDTO / UpdateDeviceTypeDTO
*   `name` (String, Required)
*   `category` (Enum [COMPUTE, NETWORK, STORAGE], Required)
*   `heightU` (Integer, Required - must be >= 1)
*   `widthMm` (Float, Required - positive)
*   `lengthMm` (Float, Required - positive)
*   `weightKg` (Float, Required - positive)
*   `frontImagePath` (String, Optional - path to front faceplate image asset)
*   `rearImagePath` (String, Optional - path to rear faceplate image asset)
*   `imagePath` (String, Optional - fallback path defaulting to frontImagePath)

### DeviceType (Entity Model)
*   `id` (Long)
*   `name` (String)
*   `category` (Enum [COMPUTE, NETWORK, STORAGE])
*   `heightU` (Integer)
*   `widthMm` (Float)
*   `lengthMm` (Float)
*   `weightKg` (Float)
*   `frontImagePath` (String)
*   `rearImagePath` (String)
*   `imagePath` (String)
*   `createdAt` (Timestamp)
*   `updatedAt` (Timestamp)

---

## 5. Error Scenarios

| Trigger | Condition | Expected System Behavior |
| :--- | :--- | :--- |
| **Template Creation** | `heightU <= 0` | Backend returns `HTTP 400 Bad Request` explaining height must be at least 1 U-slot. |
| **Template Creation** | Invalid category value supplied | Backend returns `HTTP 400 Bad Request`. |
| **Template Deletion** | The template is actively in use by one or more installed devices | Backend aborts deletion and returns `HTTP 409 Conflict` (violates database foreign keys/active business rules). |
| **Inspection / Update** | Template ID does not exist | Returns `HTTP 404 Not Found`. |

---

## 6. Constraints
*   **Referential Integrity**: A device type cannot be deleted if any installed device references its ID.
*   **Size Limits**: Height must be $\ge 1$, width/length/weight must be positive floats.
*   **Dual-Face Assets**: Device types maintain optional separate image paths for front (`frontImagePath`) and rear (`rearImagePath`) faceplates.

---

## 7. Acceptance Criteria
*   The system successfully lists all templates with full dimensions and dual-face image paths (`frontImagePath`, `rearImagePath`) via `GET /api/v1/device-types`.
*   Creating a template with invalid dimensions (heightU < 1, weight <= 0) returns HTTP 400.
*   Deleting a device type that is not referenced by any device succeeds and returns HTTP 204.
*   Deleting a device type that is actively in use by any installed device returns HTTP 409 and does not delete the template.
