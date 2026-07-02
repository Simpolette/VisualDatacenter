## Why

Currently, when a rack is selected in the 3D room viewport, camera controls (orbit and pan) are completely locked to force a rigid face-on view. Because devices can be mounted on either the FRONT or REAR face of a rack, locking camera movement prevents users from orbiting around the selected rack to inspect the rear chassis, back ports, or module bays.

## What Changes

- Modify the 3D viewport camera controls configuration (`mouseConfig`) so that selecting a rack keeps camera target locked on the rack's centroid while allowing free mouse-driven 360-degree rotation (orbiting) and zooming.
- Disable free horizontal/vertical panning while a rack is selected to prevent losing camera focus on the selected rack.

## Capabilities

### Modified Capabilities

- `room-details-page`: Update the camera interaction requirements during rack selection to allow mouse-driven camera orbiting while keeping the look-at target locked on the rack.

## Impact

- `frontend/src/pages/RoomDetailsPage/RoomScene3D.tsx`: Update `mouseConfig` logic in `SceneControls` to permit left-click orbit rotation while preserving target focus.
