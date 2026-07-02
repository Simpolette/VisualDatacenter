## Why

The current separate page header and the spacing around the 3D viewport waste vertical workspace and distract the user from the primary WebGL room simulation. Combining the room metadata directly into a unified top toolbar and converting the aggregate statistics into floating viewport overlays creates a seamless, immersive, CAD-style console.

## What Changes

- **Toolbar Integration**: Merge the Room Name, Location, and Dimensions metadata directly into a consolidated toolbar at the top of the viewport container.
- **Header Removal**: Remove the standalone page header and its surrounding padding entirely to maximize the vertical screen real estate.
- **Overlay Statistics**: Reposition the room statistics (Total Racks and Occupancy Rate) as a floating overlay card/pill in the top-right corner of the 3D Canvas viewport.
- **Integrated Switches**: Add interactive switches/toggles in the toolbar for "Show Grid" and "Show Labels" to customize the 3D scene visual overlays.
- **Reset View**: Provide a "Reset View" button in the toolbar to smoothly glide the camera back to the default room overview coordinate.
- **Flush Layout**: Remove any padding/margins between the 3D canvas viewport and the 2D slide-out sidebar, integrating them into a single border-bound interface.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `room-details-page`: Modify the layout to support an integrated top toolbar, floating stats/controls overlays, and edge-to-edge canvas alignment.

## Impact

- **Frontend**: Refactors `RoomDetailsPage.tsx` layout and spacing classes. Updates rendering in `RoomScene3D.tsx` to accept and handle toggles for grid and labels.
- **Backend/API**: None.
