# Rack Isolation Specification

## 1. Description
Defines the visual highlights and model state changes that occur when a user selects a rack in the 3D scene. This includes dimming non-selected room elements and rendering the active rack as a translucent x-ray enclosure containing physically scaled hardware devices.

---

## 2. Main Flow
1.  **Select Rack**: The user clicks on a rack mesh in the 3D room canvas.
2.  **Isolate & Highlight**: 
    *   The selected rack highlights with its utilization status color (High ≥80% Red, Medium ≥50% Yellow, Low <50% Green) and wireframe outline.
    *   All other racks in the room transition to a semi-transparent opacity (`0.15`).
3.  **Camera Focus**: OrbitControls align focus to look flat at the selected rack's front face.
4.  **X-Ray Rendering**: The selected rack solid mesh transitions to a translucent glass cabinet shell (`opacity: 0.15`) with outer frame tinted in the rack's utilization color.
5.  **Device Stack Rendering**: The system queries the rack's devices list. Each device is rendered as a distinct 3D box positioned on its occupied U-slots, scaled according to its actual height and length, and mapped with dual-face image textures (`frontImagePath` on front face, `rearImagePath` on rear face).

---

## 3. Access Control
*   **Authorization Level**: Client-side view transformation.
*   **Policy**: No authentication required. Full access is granted to all frontend visitors.

---

## 4. Data Model

### Selection State
*   `selectedRackId`: Long (Id of the active rack, or `null` if none selected)
*   `rackDevices`: List of Device objects (Installed inside the selected rack)

### Visual Attributes
*   `dimmedOpacity`: Float (Set to `0.15` for non-selected racks)
*   `cabinetOpacity`: Float (Set to `0.15` for selected rack shell)
*   `utilizationColor`: String (High ≥80% Red, Medium ≥50% Yellow, Low <50% Green)

---

## 5. Error Scenarios

*   *Note*: The rack isolation is a client-side visualization logic. There are no backend database error scenarios. If the devices list fetch fails, the frontend displays a standard API error toast, keeps the cabinet empty, and logs the loading failure.

---

## 6. Constraints
*   **Performance Stability**: The transition to translucent rendering and device box drawing must happen smoothly without causing frame drops (FPS must stay > 40).
*   **Faceplate Mapping**: Device textures map `frontImagePath` to the front face, and `rearImagePath` to the rear face. Length coordinates align based on device mounting orientation (`FRONT` or `REAR`).

---

## 7. Acceptance Criteria
*   Clicking a rack mesh outlines the rack, centers the camera facing it, and opens the sidebar panel.
*   When a rack is selected, all other racks in the room immediately dim to 0.15 opacity.
*   The selected rack renders as a transparent glass enclosure with its outer frame tinted in its utilization color (Red/Yellow/Green).
*   Each device inside the rack is rendered at its exact U-slots, scaled to its catalog `heightU` and `lengthMm` values, with dual-face textures (`frontImagePath` and `rearImagePath`).
*   Closing the sidebar restores all racks to standard rendering and re-enables orbit controls.
