# delete-rack-ui Specification

## Purpose
Define the user interface requirements and scenarios for deleting racks from a room layout, warning the user about the cascading loss of installed devices and PDUs.

## Requirements

### Requirement: Delete rack button in Rack Inspector sidebar
The Rack Inspector sidebar (`RackSidebar2D`) SHALL display a red "Delete Rack" button at the bottom of the sidebar's main view when no individual device is selected.

#### Scenario: Button visibility
- **WHEN** the Rack Inspector is open for a selected rack
- **AND** no device inspector view is currently active
- **THEN** a "Delete Rack" button with a trash icon is displayed at the bottom of the sidebar.

### Requirement: Inline rack deletion confirmation
The application SHALL display an inline confirmation prompt in the sidebar when the user clicks the "Delete Rack" button to prevent accidental clicks.

#### Scenario: Displaying inline confirmation
- **WHEN** the user clicks the "Delete Rack" button
- **THEN** the "Delete Rack" button is replaced by a warning panel.
- **AND** the panel shows the text: "Are you sure you want to delete this rack? This will also delete all devices and PDUs installed in it."
- **AND** it displays "Confirm Delete" (red) and "Cancel" buttons.

#### Scenario: Cancelling deletion
- **WHEN** the user clicks "Cancel" on the confirmation panel
- **THEN** the warning panel disappears and the original "Delete Rack" button is restored.

### Requirement: Execute rack deletion
The application SHALL send a `DELETE /api/v1/racks/{rackId}` request when the user confirms deletion, and clean up the active workspace.

#### Scenario: Successful deletion
- **WHEN** the user clicks "Confirm Delete" in the sidebar
- **THEN** the system sends `DELETE /api/v1/racks/{rackId}`.
- **AND** upon HTTP 204 success, the selection is cleared (`selectedRackId = null`), the sidebar is closed, and `fetchRacksForRoom(roomId)` is called to refresh the room layout.

#### Scenario: Delete fails with server error
- **WHEN** the DELETE request fails with a server error
- **THEN** the system displays a warning message at the top of the sidebar and restores the "Delete Rack" button.
