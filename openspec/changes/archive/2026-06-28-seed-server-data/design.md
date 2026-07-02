## Context

Currently, the database starts empty. Users must manually create every room, rack, device type, device, and PDU. Having an endpoint to seed a default set of test data simplifies local development, manual testing, and demonstrations.

## Goals / Non-Goals

**Goals:**
- Provide a `POST /api/v1/seed` endpoint that seeds the database with a pre-configured datacenter layout.
- Clear existing data before seeding to ensure a clean, predictable state.
- Seed standard device types (Dell PowerEdge R740, Cisco Catalyst 9300, HPE MSA 2060).
- Seed a default room ("Main Datacenter") with multiple racks, devices, and PDUs.

**Non-Goals:**
- Custom configuration files for seeding (keep seeding configuration hardcoded in code for simplicity).
- Authentication or authorization checks (in line with MVP sandbox model).

## Decisions

- **Feature Package**: Put all seeding logic in `com.simpolette.dcv.DcvServerApplication.features.seed`.
- **Endpoint Route**: `POST /api/v1/seed`.
- **Order of Deletion**: Clear tables in reverse dependency order: `Pdu` -> `Device` -> `Rack` -> `Room` -> `DeviceType`.
- **Seeded Room & Dimensions**:
  - Name: "Main Datacenter"
  - Location: "Building A, Floor 3"
  - Dimensions: 15.0m width, 12.0m length, 3.0m height.
- **Seeded Racks**:
  - Rack A1: 42U, posX: 3.0, posY: 4.0, rotationDeg: 0.0
  - Rack A2: 42U, posX: 4.5, posY: 4.0, rotationDeg: 0.0
  - Rack B1: 44U, posX: 3.0, posY: 8.0, rotationDeg: 180.0
  - Rack B2: 44U, posX: 4.5, posY: 8.0, rotationDeg: 180.0
- **Seeded Devices**:
  - Rack A1:
    - Dell PowerEdge R740 (Compute, 2U) at U1, face: FRONT
    - Cisco Catalyst 9300 (Network, 1U) at U10, face: FRONT
  - Rack A2:
    - HPE MSA 2060 (Storage, 2U) at U5, face: REAR
- **Seeded PDUs**:
  - Rack A1: LEFT PDU (24 outlets), RIGHT PDU (24 outlets)
  - Rack A2: REAR PDU (12 outlets)

## Risks / Trade-offs

- **Risk**: Accidentally clearing real user data.
- **Mitigation**: This is an MVP single-user sandbox system. If needed, in a production setting we would restrict or disable this endpoint. For MVP sandbox, it's explicitly desired.
