## ADDED Requirements

### Requirement: Room List page has a create room trigger
The Room List page SHALL display a "+ New Room" button in the page header that opens the create room modal.

#### Scenario: Button is visible on room list page
- **WHEN** the user navigates to `/rooms`
- **THEN** a "+ New Room" button is visible in the page header area

#### Scenario: Button opens the create room modal
- **WHEN** the user clicks the "+ New Room" button
- **THEN** the create room modal dialog opens
