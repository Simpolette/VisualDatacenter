## MODIFIED Requirements

### Requirement: Rack selection triggers camera transition
Clicking a rack mesh in the 3D scene SHALL set the selected rack, animate the camera to focus straight on the rack's front face, open the 2D rack editor sidebar, and allow mouse-driven orbit rotation around the selected rack while locking the look-at target to the rack center.

#### Scenario: Clicking a rack triggers transition
- **WHEN** the user clicks a rack mesh in the 3D canvas
- **THEN** the system sets selectedRackId, smoothly transitions the camera to center on the rack facing it flatly, slides open the 2D rack editor sidebar, and enables left-click mouse orbiting while disabling panning.
