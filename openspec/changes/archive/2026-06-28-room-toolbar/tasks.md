## 1. UI Toolbar Layout Refactoring

- [x] 1.1 Remove the standalone page header and its padding container in `RoomDetailsPage.tsx` to reclaim vertical space
- [x] 1.2 Implement the unified top toolbar container inside the main details viewport wrapper, integrating the back button, room name, floor location, and dimensions
- [x] 1.3 Add a floating stats overlay card inside the 3D canvas viewport showing total racks and overall occupancy rate (used U vs total capacity and percentage)
- [x] 1.4 Integrate the primary "+ Add Rack" button on the right side of the top toolbar

## 2. Interaction and Toggle Integration

- [x] 2.1 Declare `showGrid` and `showLabels` boolean states in `RoomDetailsPage.tsx` and connect them to the toolbar toggle switches
- [x] 2.2 Pass `showGrid` and `showLabels` to `RoomScene3D.tsx` as props and conditionally render the Drei `<Grid>` component and `<Html>` rack labels
- [x] 2.3 Add a `resetKey` state in `RoomDetailsPage.tsx` that increments on "Reset View" button clicks, and pass it to `RoomScene3D.tsx`
- [x] 2.4 Update `SceneControls` within `RoomScene3D.tsx` to listen to the `resetKey` change and smoothly glide the camera back to the default room overview position
- [x] 2.5 Ensure the slide-out `RackSidebar2D.tsx` aligns edge-to-edge with the 3D viewport canvas inside the main container with no margin/padding gaps

## 3. Visual Validation and Verification

- [x] 3.1 Compile the project with `npx tsc --noEmit` to ensure zero compilation or build errors
- [x] 3.2 Open the application room detail page and confirm header metadata, floating canvas overlays, toggle actions, and camera reset behavior are fully operational
