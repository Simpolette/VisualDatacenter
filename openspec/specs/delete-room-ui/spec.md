# delete-room-ui Specification

## Purpose
Define the user interface requirements and scenarios for deleting datacenter rooms, prompting users with confirmation to avoid accidental deletion of rooms and their contained hardware resources.

## Requirements

### Requirement: Delete room button on Room List cards
The Room List page SHALL display a delete button (trash icon) on each Room Card, which is visible on hover.

#### Scenario: Delete button hover visibility
- **WHEN** the user hovers over a room card on the `/rooms` page
- **THEN** a small trash icon button appears in the top-right corner of the card.
- **AND** clicking the button opens the Room Deletion Confirmation Modal.

### Requirement: Delete room button in Room Details header
The Room Details page header SHALL display a "Delete Room" button next to the room metadata.

#### Scenario: Delete button visibility and style
- **WHEN** the Room Details page is loaded in normal workspace mode
- **THEN** a red outline button with a trash icon and the label "Delete Room" is visible in the header.
- **AND** clicking the button opens the Room Deletion Confirmation Modal.

### Requirement: Room Deletion Confirmation Modal
The application SHALL prompt the user with a confirmation modal before executing a room deletion, detailing the cascading impact.

#### Scenario: Displaying the modal
- **WHEN** the user clicks any Delete Room button
- **THEN** a modal overlays the screen titled "Delete Room".
- **AND** it displays the warning: "Are you sure you want to delete room {roomName}? This will permanently delete the room, all of its racks, and all devices installed in those racks. This action cannot be undone."
- **AND** it displays a "Delete Room" button (danger style) and a "Cancel" button.

#### Scenario: Cancelling deletion
- **WHEN** the user clicks "Cancel" or closes the modal
- **THEN** the modal closes and no deletion is executed.

### Requirement: Execute room deletion
The application SHALL send a `DELETE /api/v1/rooms/{roomId}` request when the user confirms deletion, and update the application state.

#### Scenario: Successful deletion from Room Details page
- **WHEN** the user clicks "Delete Room" in the modal triggered from `/rooms/:id`
- **THEN** the system sends `DELETE /api/v1/rooms/{roomId}`.
- **AND** upon HTTP 204 success, the modal closes, the room is removed from the store, and the user is redirected to `/rooms`.

#### Scenario: Successful deletion from Room List page
- **WHEN** the user clicks "Delete Room" in the modal triggered from `/rooms`
- **THEN** the system sends `DELETE /api/v1/rooms/{roomId}`.
- **AND** upon HTTP 204 success, the modal closes, and the room list is refreshed (or the room is removed from the local store).

#### Scenario: Delete fails with server error
- **WHEN** the DELETE request fails with a server error
- **THEN** the system displays a toast-style error message and keeps the modal open for retry or cancellation.
