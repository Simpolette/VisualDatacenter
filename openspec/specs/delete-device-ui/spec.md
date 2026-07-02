# delete-device-ui Specification

## Purpose
TBD - created by archiving change add-device-to-rack. Update Purpose after archive.
## Requirements
### Requirement: Delete device button on each device card
The Rack Inspector sidebar SHALL display a delete button (trash icon) on each device entry in the U-slot grid and/or device list.

#### Scenario: Delete button visibility
- **WHEN** the Rack Inspector sidebar is open and displays installed devices
- **THEN** each device card shows a small trash icon button on hover, positioned at the top-right of the device overlay

### Requirement: Inline delete confirmation
The application SHALL show an inline confirmation prompt when the user clicks the delete button, replacing the device card content temporarily.

#### Scenario: Triggering delete confirmation
- **WHEN** the user clicks the trash icon on a device card
- **THEN** the device card content is replaced with a confirmation prompt showing "Delete {deviceName}?" with "Confirm" and "Cancel" buttons

#### Scenario: Cancelling deletion
- **WHEN** the user clicks "Cancel" on the delete confirmation prompt
- **THEN** the confirmation prompt disappears and the original device card content is restored

### Requirement: Execute device deletion
The application SHALL send a `DELETE /api/v1/devices/{deviceId}` request when the user confirms deletion, and refresh the rack details upon success.

#### Scenario: Successful deletion
- **WHEN** the user clicks "Confirm" on the delete confirmation prompt
- **THEN** the system sends `DELETE /api/v1/devices/{deviceId}`, and upon HTTP 204 success, calls `fetchRackDetails(rackId)` to refresh the sidebar data, showing the freed U-slots

#### Scenario: Delete fails with server error
- **WHEN** the DELETE request fails with a server error
- **THEN** the system displays a toast-style error message at the top of the sidebar and restores the device card to its original state

#### Scenario: Delete device not found
- **WHEN** the DELETE request returns HTTP 404 (device already removed)
- **THEN** the system refreshes rack details to reflect the current state

