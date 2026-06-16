## 1. Project Setup & Dependencies

- [x] 1.1 Add `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, and `org.postgresql:postgresql` dependencies to `build.gradle`
- [x] 1.2 Add `application.properties` (or `application.yml`) with PostgreSQL datasource config, JPA/Hibernate settings (`ddl-auto=update`, `show-sql=true`), and server port
- [x] 1.3 Add CORS configuration class in `common/config/WebConfig.java` allowing all origins for development

## 2. Exception Handling (`common/exception/`)

- [x] 2.1 Create `common/exception/ResourceNotFoundException.java` (extends `RuntimeException`) with entity name and id fields
- [x] 2.2 Create `common/exception/SlotConflictException.java` (extends `RuntimeException`) with conflict detail message
- [x] 2.3 Create `common/exception/GlobalExceptionHandler.java` (`@RestControllerAdvice`) mapping: `ResourceNotFoundException` → 404, `SlotConflictException` → 409, `MethodArgumentNotValidException` → 400, `DataIntegrityViolationException` → 409, generic `Exception` → 500. Use consistent error response body `{ status, error, message, timestamp }`

## 3. DeviceType Entity & CRUD (`features/devicetype/`)

- [x] 3.1 Create `features/devicetype/DeviceType.java` JPA entity with fields: id (Long, auto-generated), name (String, not blank), category (enum: COMPUTE, NETWORK, STORAGE), heightU (int, min 1), widthMm (Float), depthMm (Float), weightKg (Float), imagePath (String, nullable), createdAt (Timestamp, auto-set)
- [x] 3.2 Create `features/devicetype/DeviceTypeRepository.java` (Spring Data JPA)
- [x] 3.3 Create DTOs in `features/devicetype/dto/`: `CreateDeviceTypeDTO`, `UpdateDeviceTypeDTO` as Java records with validation annotations
- [x] 3.4 Create `features/devicetype/DeviceTypeService.java` with list, create, update, delete methods. Delete SHALL reject with 409 if any devices reference the type
- [x] 3.5 Create `features/devicetype/DeviceTypeController.java` (`/api/v1/device-types`) with GET (list), POST (create), PUT /:id (update), DELETE /:id (delete)

## 4. Room Entity & CRUD (`features/room/`)

- [x] 4.1 Create `features/room/Room.java` JPA entity with fields: id, name (unique), location, widthM (positive), depthM (positive), heightM, floorPlanImage, createdAt, updatedAt. Include `@OneToMany` to Rack with `CascadeType.ALL` and `orphanRemoval=true`
- [x] 4.2 Create `features/room/RoomRepository.java` with `existsByName(String)` query method
- [x] 4.3 Create DTOs in `features/room/dto/`: `CreateRoomDTO`, `UpdateRoomDTO`, `RoomDetailDTO` (includes racks, rackCount, totalCapacityU, usedU)
- [x] 4.4 Create `features/room/RoomService.java` with list, create (unique name check), getDetail (compute capacity stats), update, delete methods
- [x] 4.5 Create `features/room/RoomController.java` (`/api/v1/rooms`) with GET (list), POST (create → 201), GET /:id (detail), PUT /:id (update), DELETE /:id (delete → 204)

## 5. Rack Entity & CRUD (`features/rack/`)

- [x] 5.1 Create `features/rack/Rack.java` JPA entity with fields: id, room (ManyToOne), name, totalUnits (42 or 44), posX, posY, rotationDeg, createdAt, updatedAt. Include `@OneToMany` to Device and PDU with cascade and orphanRemoval
- [x] 5.2 Create `features/rack/RackRepository.java` with `findByRoomId(Long)` and `existsByRoomIdAndName(Long, String)` query methods
- [x] 5.3 Create DTOs in `features/rack/dto/`: `CreateRackDTO`, `UpdateRackDTO`, `RackDetailDTO` (includes devices, pdus, freeUnits, occupiedUnits), `UtilizationDTO` (totalUnits, occupiedUnits, freeUnits, utilizationPercent)
- [x] 5.4 Create `features/rack/RackService.java` with listByRoom, create (unique name per room, validate totalUnits ∈ {42,44}), getDetail (compute free/occupied), update, delete, getUtilization methods
- [x] 5.5 Create `features/rack/RackController.java` with GET `/api/v1/rooms/:roomId/racks`, POST `/api/v1/rooms/:roomId/racks`, GET `/api/v1/racks/:id`, PUT `/api/v1/racks/:id`, DELETE `/api/v1/racks/:id`, GET `/api/v1/racks/:id/utilization`

## 6. Device Entity & CRUD with Slot Validation (`features/device/`)

- [x] 6.1 Create `features/device/Device.java` JPA entity with fields: id, rack (ManyToOne), deviceType (ManyToOne), name, startU (int, min 1), face (enum: FRONT, REAR, default FRONT), status (enum: ACTIVE, MAINTENANCE, OFFLINE), createdAt, updatedAt
- [x] 6.2 Create `features/device/DeviceRepository.java` with `findByRackIdAndFace(Long, Face)` query method
- [x] 6.3 Create `common/validation/SlotValidator.java` utility class implementing U-slot collision detection: given a rack, face, startU, and heightU, query existing devices on that face and check for range overlap `[startU, startU + heightU - 1]`. Also validate bounds: `startU >= 1` and `startU + heightU - 1 <= rack.totalUnits`
- [x] 6.4 Create DTOs in `features/device/dto/`: `InstallDeviceDTO`, `UpdateDeviceDTO` as Java records
- [x] 6.5 Create `features/device/DeviceService.java` with install (validate slot via SlotValidator, resolve DeviceType, default face), update (re-validate slot if position changed, excluding self), delete methods
- [x] 6.6 Create `features/device/DeviceController.java` with POST `/api/v1/racks/:rackId/devices` (→ 201), PUT `/api/v1/devices/:id`, DELETE `/api/v1/devices/:id` (→ 204)

## 7. PDU Entity & CRUD (`features/pdu/`)

- [x] 7.1 Create `features/pdu/Pdu.java` JPA entity with fields: id, rack (ManyToOne), name, position (enum: LEFT, RIGHT, REAR), outletCount, createdAt
- [x] 7.2 Create `features/pdu/PduRepository.java` with `countByRackId(Long)` and `existsByRackIdAndPosition(Long, Position)` query methods
- [x] 7.3 Create DTOs in `features/pdu/dto/`: `CreatePduDTO` as Java record
- [x] 7.4 Create `features/pdu/PduService.java` with attach (validate max 2 per rack, unique position) and detach methods
- [x] 7.5 Create `features/pdu/PduController.java` with POST `/api/v1/racks/:rackId/pdus` (→ 201), DELETE `/api/v1/pdus/:id` (→ 204)

## 8. Verification

- [x] 8.1 Start the application and verify all endpoints respond correctly via manual testing or a REST client (Swagger/Postman)
- [ ] 8.2 Verify cascade delete: create room → add rack → install device → delete room → confirm all children deleted
- [ ] 8.3 Verify U-slot collision: install device → attempt overlapping install → confirm 409 response
