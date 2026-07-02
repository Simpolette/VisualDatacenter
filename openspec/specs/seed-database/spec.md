# seed-database Specification

## Purpose
Database seeding capability to reset and populate the database with default datacenter layouts for testing and local development.
## Requirements
### Requirement: Trigger Database Seeding
The system SHALL expose a `POST /api/v1/seed` REST API endpoint to clear the database and populate it with default seed data.

#### Scenario: Successful seeding of empty or populated database
- **WHEN** a POST request is sent to `/api/v1/seed`
- **THEN** the system returns a 200 OK status with a JSON object containing a success message and details of the seeded entities (counts of rooms, racks, devices, device types, and PDUs)

