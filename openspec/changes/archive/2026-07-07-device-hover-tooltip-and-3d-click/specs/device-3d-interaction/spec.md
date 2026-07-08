## ADDED Requirements

### Requirement: 3D device hover tooltip overlay
When a rack is selected and its X-ray view is active, hovering over a device mesh inside the rack SHALL display a floating HTML tooltip overlay anchored above the device. The tooltip SHALL display the device's name, device type name, status, and live telemetry metrics (CPU, RAM, Temperature) sourced from the telemetry store. The tooltip SHALL disappear when the pointer leaves the device mesh.

#### Scenario: Hovering over a device displays tooltip
- **WHEN** the user hovers the pointer over a device mesh inside a selected rack's X-ray view
- **THEN** the system renders an `Html` overlay positioned above the device mesh showing the device name, device type name, and a status indicator (ACTIVE/MAINTENANCE/OFFLINE)

#### Scenario: Tooltip displays live telemetry metrics
- **WHEN** the tooltip is visible and the telemetry store contains metrics for the hovered device
- **THEN** the tooltip SHALL display the latest CPU utilization, RAM usage, and Temperature values with their units

#### Scenario: Tooltip displays no-data state for telemetry
- **WHEN** the tooltip is visible and the telemetry store has no metrics for the hovered device
- **THEN** the tooltip SHALL display a "No telemetry data" placeholder in the metrics section

#### Scenario: Tooltip disappears on pointer leave
- **WHEN** the user moves the pointer away from the device mesh
- **THEN** the tooltip overlay is removed from the scene

### Requirement: 3D device hover emissive glow
When the pointer hovers over a device mesh inside a selected rack, the device mesh SHALL display a subtle emissive glow effect to indicate interactivity.

#### Scenario: Device glows on hover
- **WHEN** the user hovers the pointer over a device mesh inside a selected rack
- **THEN** the device mesh body materials SHALL increase their `emissiveIntensity` and apply a soft cyan/blue emissive tint to provide visual hover feedback

#### Scenario: Glow clears on pointer leave
- **WHEN** the user moves the pointer away from a previously hovered device mesh
- **THEN** the device mesh body materials SHALL return to their default emissive state

### Requirement: 3D device click-to-inspect
Clicking a device mesh inside a selected rack's X-ray view SHALL open the device detail panel in the sidebar, matching the behavior of clicking a device row in the sidebar's U-slot grid.

#### Scenario: Clicking a device in 3D opens sidebar detail view
- **WHEN** the user clicks on a device mesh inside a selected rack's X-ray view
- **THEN** the system SHALL set `selectedDeviceId` in the global store to the clicked device's ID, triggering the sidebar to navigate to the device detail panel and fetch full device details from `GET /api/v1/devices/{id}`

#### Scenario: Clicking a different device switches the detail view
- **WHEN** the user clicks on a different device mesh while a device detail panel is already open
- **THEN** the system SHALL update `selectedDeviceId` to the new device's ID, replacing the currently displayed device detail panel

### Requirement: Shared device selection state
The device selection state SHALL be managed in the global `useRackStore` so that both the 3D viewport and the sidebar can read and write device selection consistently.

#### Scenario: Store exposes selectedDeviceId and selectDevice action
- **WHEN** the application initializes the rack store
- **THEN** the store SHALL expose a `selectedDeviceId: number | null` state field and a `selectDevice(id: number | null)` action that updates it

#### Scenario: Sidebar reacts to store-driven device selection
- **WHEN** `selectedDeviceId` changes in the store (from any source: 3D click or sidebar click)
- **THEN** the sidebar SHALL display the device detail panel for the selected device, fetching device details if not already loaded

#### Scenario: Clearing rack selection clears device selection
- **WHEN** the user deselects the current rack (closes the sidebar)
- **THEN** the system SHALL also clear `selectedDeviceId` to null
