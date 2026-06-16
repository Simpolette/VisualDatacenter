## Why

The Visual Datacenter platform needs a working backend before any frontend (2D rack editor, 3D room viewer) can function. Currently, the Spring Boot application is an empty shell with no entities, repositories, services, or REST controllers. Without CRUD APIs for the core domain — rooms, racks, and devices — there is nothing to render, simulate, or interact with. This is the foundational backend work that unblocks all other features.

## What Changes

- Add JPA entities for **Room**, **Rack**, **Device**, **DeviceType**, and **PDU** with full relational mapping (Room → Rack → Device, DeviceType → Device, Rack → PDU).
- Add Spring Data JPA repositories for each entity.
- Add service-layer classes implementing business logic including **U-slot collision detection** for device placement.
- Add REST controllers exposing CRUD endpoints under `/api/v1` for rooms, racks, devices, device types, and PDUs.
- Add request/response DTOs (Create, Update, Detail) for each resource.
- Add global exception handling (`@ControllerAdvice`) with `ResourceNotFoundException` and `SlotConflictException`.
- Add database configuration for PostgreSQL with JPA/Hibernate auto-DDL.
- Add CORS configuration for frontend development.
- Add Gradle dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, PostgreSQL driver.

## Capabilities

### New Capabilities
- `room-crud`: CRUD operations for datacenter rooms — list, create, get (with racks summary), update, delete (cascade).
- `rack-crud`: CRUD operations for racks within rooms — list by room, create in room, get (with devices/PDUs), update, delete (cascade). Includes utilization endpoint.
- `device-crud`: Install, update (move U-slot), and remove devices from racks. Includes server-side U-slot collision detection to prevent overlapping device placement.
- `device-type-crud`: CRUD for the device type catalog — reusable templates defining device dimensions, category, and height in rack units.
- `pdu-crud`: Attach and detach PDUs to racks with position and count constraints.

### Modified Capabilities
_(none — no existing specs)_

## Impact

- **Backend codebase**: Major additions across `com.simpolette.dcv` — five new packages (room, rack, device, devicetype, pdu) plus config, validation, and exception packages.
- **Dependencies**: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `org.postgresql:postgresql` added to `build.gradle`.
- **Database**: PostgreSQL database required; Hibernate auto-generates schema from entity annotations.
- **API surface**: ~20 new REST endpoints under `/api/v1`.
- **Frontend**: Unblocked to begin API integration once these endpoints are available.
