## Context

The backend REST API provides full support for PDU entities via `POST /api/v1/racks/{rackId}/pdus` and `DELETE /api/v1/pdus/{pduId}`. However, the frontend currently has no UI elements or 3D meshes to visualize or manage PDUs. Datacenter operators need a way to see installed Zero-U PDUs in 3D attached to the outside of the rack enclosure and attach/detach PDUs in the 2D rack inspector sidebar.

## Goals / Non-Goals

**Goals:**
- Create a reusable 3D sub-component `RackPdu3D.tsx` in `frontend/src/components/RoomDetails/` to render Zero-U PDU strips with a light metallic silver finish on the outside of 3D rack enclosures for `LEFT`, `RIGHT`, and `REAR` positions.
- Integrate PDU visualization into `RackMesh.tsx`.
- Add PDU management cards & creation forms to `RackSidebar2D.tsx`.
- Add `createPdu` and `deletePdu` actions to `useRackStore.ts`.

**Non-Goals:**
- Modifying backend PDU entities or database schemas (already implemented and tested).
- Simulating outlet-level power draw calculations or phase load balancing in this change.

## Decisions

### Decision 1: Dedicated 3D Sub-Component (`RackPdu3D.tsx`)
- **Choice**: Extract 3D PDU geometry, positioning offsets, and light metallic materials into `RackPdu3D.tsx` under `src/components/RoomDetails/`. Mount PDUs on the outside walls (`x = ±(RACK_WIDTH/2 + 0.03m)`, `z = -meshLength/2 - 0.03m`).
- **Rationale**: Keeps `RackMesh.tsx` SRP-compliant while encapsulating spatial math for `LEFT` (`-x`), `RIGHT` (`+x`), and `REAR` (`-z`) PDU positioning.

### Decision 2: 2D Sidebar PDU Card & Form in `RackSidebar2D.tsx`
- **Choice**: Add a collapsible PDU section to the 2D sidebar inspector displaying active PDUs with position badges, outlet counts, and a modal/inline form to attach a new PDU.
- **Rationale**: Provides clear operational feedback to operators inspecting a rack without cluttering the U-slot device grid.

## Risks / Trade-offs

- **[Risk] 3D Mesh Z-Fighting with Rack Enclosures** → *Mitigation*: Mount PDUs on the outside surface with a `0.03m` clearance gap to prevent visual clipping with the rack's outer frame pillars.
