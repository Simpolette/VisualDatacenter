## Purpose
Display all datacenter rooms in a card grid with summary metadata and loading/error states.
## Requirements
### Requirement: Room List page renders a card grid
The Room List page SHALL display all rooms as a responsive card grid. Room data SHALL be fetched via a `useRoomStore` Zustand store that calls `GET /api/v1/rooms`, making room data available to other pages without re-fetching.

#### Scenario: Rooms are displayed on load
- **WHEN** the user navigates to `/rooms`
- **THEN** the page fetches rooms from the API and renders one card per room

#### Scenario: Empty state
- **WHEN** the API returns an empty array
- **THEN** the page displays a message indicating no rooms exist yet

---

### Requirement: Room card shows room identity and dimensions
Each room card SHALL display the room name and physical dimensions (width × length in meters) and support navigation to its details page.

#### Scenario: Card displays room name
- **WHEN** a room card is rendered
- **THEN** the room name is displayed prominently as the card heading

#### Scenario: Card displays dimensions
- **WHEN** a room card is rendered
- **THEN** the card shows the room's width and length in meters

#### Scenario: Clicking card navigates to room details
- **WHEN** the user clicks on a room card
- **THEN** the application navigates to `/rooms/:id` for that room

### Requirement: Loading and error states
The Room List page SHALL handle asynchronous fetch states gracefully.

#### Scenario: Loading state
- **WHEN** the API request is in-flight
- **THEN** the page displays a loading spinner in place of the card grid

#### Scenario: Fetch error state
- **WHEN** the API request fails (network error or non-2xx response)
- **THEN** the page displays an error message and a retry button

#### Scenario: Retry after error
- **WHEN** the user clicks the retry button on the error state
- **THEN** the page re-fetches from `GET /api/v1/rooms`

### Requirement: Room List page has a create room trigger
The Room List page SHALL display a "+ New Room" button in the page header that opens the create room modal.

#### Scenario: Button is visible on room list page
- **WHEN** the user navigates to `/rooms`
- **THEN** a "+ New Room" button is visible in the page header area

#### Scenario: Button opens the create room modal
- **WHEN** the user clicks the "+ New Room" button
- **THEN** the create room modal dialog opens

