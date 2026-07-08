# Camera Orbit Control Specification

## 1. Description
Defines the client-side interaction rules for the 3D room canvas camera, including orbiting, zooming, panning, movement boundaries, and overview reset animations.

---

## 2. Main Flow
1.  **Mount Viewport**: The user loads the room details page `/rooms/:id`, initializing the Three.js canvas.
2.  **Navigation Interaction**:
    *   **Orbit/Rotate**: The user clicks and drags the left mouse button. The camera rotates around the target focal point.
    *   **Zoom**: The user scrolls the mouse wheel. The camera distance to the focal target decreases or increases.
    *   **Pan**: The user clicks and drags the right mouse button. The focal target shifts across the horizontal/vertical scene plane.
3.  **Reset View**: The user clicks the "Reset View" button in the top toolbar. The camera smoothly glides back to its default coordinates, resetting the focal target back to the center of the room.

---

## 3. Access Control
*   **Authorization Level**: Client-side interaction.
*   **Policy**: No server-side authentication required. Full access is granted to all frontend visitors.

---

## 4. Data Model

### Camera Parameters (State Only)
*   `position`: Vector3 `{ x: number, y: number, z: number }` (Current camera coordinate in world space)
*   `target`: Vector3 `{ x: number, y: number, z: number }` (Point of focus for OrbitControls)
*   `fov`: Integer (Field of view - default 50)
*   `minDistance` / `maxDistance`: Floats (Restrict camera distance boundaries)
*   `minPolarAngle` / `maxPolarAngle`: Floats (Restrict vertical orbit rotation angle)

---

## 5. Error Scenarios

*   *Note*: The camera system runs entirely client-side. There are no server-side error scenarios. If the 3D canvas fails to compile or load (e.g. WebGL disabled), the system displays a fallback message: *"WebGL not supported in this browser. Please enable hardware acceleration."*

---

## 6. Constraints
*   **No Under-Floor Camera**: The `maxPolarAngle` must be capped at 85 degrees (approx. `1.48` radians) to prevent the camera from going underneath the room floor plane.
*   **Zoom Bounds**: Zoom distance is clamped to prevent clipping through rack geometries or moving too far away from the room boundaries.
*   **Fluid Transitions**: Resets must use smooth interpolations (e.g., cubic easing) over a duration of 800ms to 1200ms rather than immediate coordinate jumps.

---

## 7. Acceptance Criteria
*   Left-click drag rotates the scene; right-click drag pans the viewport; mouse scroll zooms in/out.
*   The camera cannot rotate below the ground plane (checked by dragging downward to the maximum polar angle limit).
*   Clicking the "Reset View" button in the workspace toolbar triggers a smooth animation that glides the camera back to the original starting angle and position.
*   OrbitControls are temporarily disabled during camera animations to prevent input conflicts and are re-enabled upon arrival.
