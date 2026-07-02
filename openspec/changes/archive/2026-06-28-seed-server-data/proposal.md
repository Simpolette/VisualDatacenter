## Why

Starting a new instance of the Visual Datacenter server begins with an empty database. Manually creating device types, rooms, racks, devices, and PDUs via individual API calls or UI forms is tedious and time-consuming. Exposing an endpoint to seed a rich default dataset enables immediate testing, demonstration, and validation of both backend and frontend components.

## What Changes

- Add a new database seeding feature in the backend under a new `seed/` feature package.
- Expose a `POST /api/v1/seed` endpoint that populates the database with default data (e.g., standard DeviceTypes, a Room, multiple Racks, Devices, and PDUs).
- Implement the seeder to clear existing data before seeding (cascade deletes will clean up racks, devices, and PDUs, but device types and rooms need to be cleared/deleted).
- Allow optional query parameters to customize seed behavior if needed (e.g., whether to clear first).

## Capabilities

### New Capabilities
- `seed-database`: Expose a REST API to seed a default set of DeviceTypes, Rooms, Racks, Devices, and PDUs to quickly bootstrap a sandbox environment.

### Modified Capabilities
None.

## Impact

- **Backend APIs**: A new endpoint `POST /api/v1/seed` will be added.
- **Frontend**: A way to trigger this seed action could be added later, but for now the backend provides the API capability.
- **Database**: Clears tables (Room, DeviceType) on invocation, cascade deleting related records, and inserting default records.
