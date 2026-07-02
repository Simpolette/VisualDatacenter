## MODIFIED Requirements

### Requirement: Room card shows room identity and dimensions
Each room card SHALL display the room name and physical dimensions (width × depth in meters) and support navigation to its details page.

#### Scenario: Card displays room name
- **WHEN** a room card is rendered
- **THEN** the room name is displayed prominently as the card heading

#### Scenario: Card displays dimensions
- **WHEN** a room card is rendered
- **THEN** the card shows the room's width and depth in meters

#### Scenario: Clicking card navigates to room details
- **WHEN** the user clicks on a room card
- **THEN** the application navigates to `/rooms/:id` for that room
