# install-device-ui Specification

## Purpose
TBD - created by archiving change add-device-to-rack. Update Purpose after archive.
## Requirements
### Requirement: Install device form in Rack Inspector sidebar
The application SHALL display a collapsible "Install Device" form section within the Rack Inspector sidebar (`RackSidebar2D`), toggled by an "Add Device" button. The form SHALL contain fields for device type selection, device name, start U-slot position, and face selection.

#### Scenario: Opening the install form
- **WHEN** the user clicks the "Add Device" button in the Rack Inspector sidebar
- **THEN** the system expands the Install Device form section at the top of the sidebar, fetches the device type catalog from `GET /api/v1/device-types`, and populates the device type dropdown

#### Scenario: Closing the install form
- **WHEN** the user clicks the "Cancel" button or the collapse toggle on the install form
- **THEN** the form collapses, any in-progress field values are cleared, and the sidebar returns to the device list view

### Requirement: Device type selection dropdown
The Install Device form SHALL display a dropdown listing all available device types fetched from `GET /api/v1/device-types`, showing each type's name, category, and height in U-slots.

#### Scenario: Device types loaded successfully
- **WHEN** the form is opened and device types are fetched
- **THEN** the dropdown displays all device types with format "{name} ({category}, {heightU}U)"

#### Scenario: No device types available
- **WHEN** the form is opened and the device type catalog is empty
- **THEN** the form displays a message "No device types available. Create device types first." and the submit button is disabled

#### Scenario: Device type fetch fails
- **WHEN** the API call to `GET /api/v1/device-types` fails
- **THEN** the form displays an error message and a retry button

### Requirement: Install device form validation
The Install Device form SHALL validate inputs using `react-hook-form` with a Zod schema before submission. The validation SHALL enforce: deviceTypeId is required, startU is required and ≥ 1, and face defaults to "FRONT" if not specified.

#### Scenario: Valid form submission
- **WHEN** the user selects a device type, enters a name "Web Server 01", sets startU to 5, selects face "FRONT", and clicks "Install"
- **THEN** the system sends `POST /api/v1/racks/{rackId}/devices` with `{ deviceTypeId, name, startU, face }` and the device is installed

#### Scenario: Missing required fields
- **WHEN** the user attempts to submit without selecting a device type or without entering a startU value
- **THEN** the form displays inline validation errors for the missing fields and does not submit

#### Scenario: Start U below minimum
- **WHEN** the user enters startU as 0 or a negative number
- **THEN** the form displays a validation error "Start U must be at least 1"

### Requirement: Handle server-side slot conflict errors
The Install Device form SHALL display server-side validation errors returned from the backend, specifically U-slot collision errors (HTTP 409) and out-of-bounds errors (HTTP 400).

#### Scenario: Slot collision on same face
- **WHEN** the user submits the form and the backend returns HTTP 409 with a slot conflict error
- **THEN** the form displays the error message from the server response (e.g., "Slots 5–6 on FRONT are already occupied") without clearing the form fields

#### Scenario: Device exceeds rack bounds
- **WHEN** the user submits the form and the backend returns HTTP 400 because the device would exceed the rack's total units
- **THEN** the form displays the error message from the server response

### Requirement: Refresh rack details after successful installation
The application SHALL refresh the rack details (device list, utilization stats, U-slot grid) after a device is successfully installed.

#### Scenario: Successful install refreshes sidebar
- **WHEN** a device installation API call succeeds with HTTP 201
- **THEN** the system calls `fetchRackDetails(rackId)` to reload the rack data, collapses the install form, and the newly installed device appears in the U-slot grid and device list

### Requirement: Device name auto-generation
The Install Device form SHALL auto-generate a default device name when the user selects a device type, using the pattern "{deviceTypeName} #{nextIndex}".

#### Scenario: Auto-generating device name
- **WHEN** the user selects a device type named "Dell PowerEdge R740" and the rack currently has 2 devices of that type
- **THEN** the name field is auto-populated with "Dell PowerEdge R740 #3" but remains editable

