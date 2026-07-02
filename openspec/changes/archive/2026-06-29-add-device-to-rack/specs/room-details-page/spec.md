## MODIFIED Requirements

### Requirement: Rack Manager 2D sidebar panel
The application SHALL display a 2D slide-out sidebar for the selected rack, showing its U-slot utilization and installed devices. The sidebar SHALL include an "Add Device" action button in the header area and per-device delete actions on each device card in the U-slot grid.

#### Scenario: Sidebar displays U-slots and devices
- **WHEN** selectedRackId is not null
- **THEN** the sidebar fetches rack details from `GET /api/v1/racks/:id` and displays a vertical grid of U-slots (1 to totalUnits) from bottom to top, with installed devices highlighted across their occupied slots (startU to startU + heightU - 1)

#### Scenario: Sidebar displays Add Device button
- **WHEN** the Rack Inspector sidebar is open with rack details loaded
- **THEN** the sidebar header area includes an "Add Device" button that toggles the Install Device form

#### Scenario: Sidebar displays device delete actions
- **WHEN** the sidebar displays installed device cards in the U-slot grid
- **THEN** each device card includes a hover-revealed trash icon button for deletion

#### Scenario: Closing the sidebar
- **WHEN** the user clicks the close button in the sidebar or presses Esc
- **THEN** selectedRackId is set back to null, the sidebar slides shut, any open install form is collapsed, and manual camera OrbitControls are re-enabled
