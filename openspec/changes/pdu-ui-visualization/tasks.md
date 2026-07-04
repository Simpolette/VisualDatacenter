## 1. PDU Store Actions

- [x] 1.1 Add `createPdu(rackId, data)` and `deletePdu(pduId)` actions to `useRackStore.ts`

## 2. 3D PDU Rendering Components

- [x] 2.1 Create 3D PDU hardware component `RackPdu3D.tsx` in `frontend/src/components/RoomDetails/`
- [x] 2.2 Integrate `RackPdu3D` into `RackMesh.tsx` to render attached `LEFT`, `RIGHT`, and `REAR` PDUs

## 3. 2D Sidebar PDU Management UI

- [x] 3.1 Create PDU list card and PDU creation modal/drawer inside `RackSidebar2D.tsx`
- [x] 3.2 Add PDU attachment and removal handlers with store integration

## 4. Verification

- [x] 4.1 Run `npx tsc --noEmit` and confirm zero TypeScript errors
