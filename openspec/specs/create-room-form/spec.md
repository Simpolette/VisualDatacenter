# create-room-form Specification

## Purpose
TBD - created by archiving change create-room-ui. Update Purpose after archive.
## Requirements
### Requirement: Create Room form modal
The system SHALL display a modal dialog containing a room creation form when triggered from the Room List page.

#### Scenario: Modal opens on button click
- **WHEN** the user clicks the "+ New Room" button on the Room List page
- **THEN** a modal dialog appears overlaying the page with a form for room creation

#### Scenario: Modal closes on cancel
- **WHEN** the user clicks the Cancel button or the backdrop overlay
- **THEN** the modal closes and no room is created

#### Scenario: Modal closes on Escape key
- **WHEN** the modal is open and the user presses the Escape key
- **THEN** the modal closes

---

### Requirement: Room creation form fields
The form SHALL contain fields matching the backend `CreateRoomDTO`: `name` (text, required), `location` (text, optional), `widthM` (number, required, positive), `lengthM` (number, required, positive). The frontend SHALL validate these fields against a defined Zod schema before submission.

#### Scenario: Required fields are enforced
- **WHEN** the user submits the form with `name` blank or `widthM`/`lengthM` empty or non-positive
- **THEN** Zod schema validation fails, inline error messages are shown next to the invalid fields, and the form is not submitted

#### Scenario: Optional fields accept empty values
- **WHEN** the user leaves `location` blank and fills all required fields
- **THEN** the form submits successfully with `location` as null

---

### Requirement: Successful room creation
The system SHALL submit the form data to `POST /rooms` (relative to the API base URL) and handle success.

#### Scenario: Room is created and list refreshes
- **WHEN** the user fills valid data and clicks "Create"
- **THEN** the system POSTs to `/rooms`, the modal closes, and the room list refreshes to include the new room

#### Scenario: Submit button shows loading state
- **WHEN** the API request is in-flight
- **THEN** the submit button is disabled and shows a loading indicator

---

### Requirement: Server error handling in the form
The system SHALL display server-side errors within the modal without closing it.

#### Scenario: Duplicate room name error
- **WHEN** the server returns a 409 (duplicate name)
- **THEN** the modal stays open and displays an error message indicating the name is already taken

#### Scenario: General server error
- **WHEN** the server returns a non-2xx response (other than 409)
- **THEN** the modal stays open and displays the error message from the response

