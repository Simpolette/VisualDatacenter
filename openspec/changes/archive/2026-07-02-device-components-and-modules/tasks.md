## 1. Database & JPA Entities

- [x] 1.1 Create template entity classes: `InterfaceTemplate`, `PowerPortTemplate`, `ConsolePortTemplate`, `ModuleBayTemplate`
- [x] 1.2 Create entity class `ModuleType` containing lists of component templates
- [x] 1.3 Create live component entity classes: `Interface`, `PowerPort`, `ConsolePort`, `ModuleBay`
- [x] 1.4 Create `Module` entity class representing an installed hardware expansion card
- [x] 1.5 Establish relationships and foreign keys on `Device` and `DeviceType` entities
- [x] 1.6 Create Spring Data JPA repositories for all new template and live entities

## 2. Backend Service Logic

- [x] 2.1 Implement `Device` creation listener or service logic to auto-instantiate ports and empty module bays from `DeviceType` templates
- [x] 2.2 Implement service logic to install a module into a device's module bay (validating that the slot is empty and instantiating card ports on the device)
- [x] 2.3 Implement service logic to uninstall a module (cascading delete to associated ports and freeing up the module bay)
- [x] 2.4 Add port name collision handling (prefixing conflicting port names with the slot name)

## 3. API Controllers & DTOs

- [x] 3.1 Create DTOs (Java records) for `ModuleType`, component templates, module bays, and live ports
- [x] 3.2 Implement CRUD endpoints for `ModuleType` under `/api/v1/module-types`
- [x] 3.3 Extend `/api/v1/device-types` endpoints to return component templates and module bay templates
- [x] 3.4 Implement `/api/v1/devices/{deviceId}/bays/{bayId}/install` endpoint to install a card
- [x] 3.5 Implement `/api/v1/devices/{deviceId}/modules/{moduleId}` endpoint to uninstall a card

## 4. Seeding Sample Data

- [x] 4.1 Update `SeedService.java` to define sample component templates (e.g. interfaces and power inlets) on existing DeviceTypes (Dell R740, Cisco 9300, HPE MSA 2060)
- [x] 4.2 Add sample `ModuleType` definitions (e.g. expansion network modules) and seed them into the database
- [x] 4.3 Update seed data to demonstrate devices pre-populated with installed modules in slots

## 5. Frontend Types & State Store

- [x] 5.1 Update frontend interface definitions (`DeviceType`, `DeviceSummary`, etc.) to include components, module bays, and live ports
- [x] 5.2 Extend `useRackStore.ts` with state and fetch actions for `ModuleType` catalog
- [x] 5.3 Implement API integration actions in `useRackStore.ts` for installing and uninstalling modules

## 6. Frontend UI Components

- [x] 6.1 Update the rack visualization and device detail sidebar to list device ports (interfaces, power, console)
- [x] 6.2 Render module bays on the device detail view, displaying whether they are empty or occupied
- [x] 6.3 Build an "Install Module" form dialog allowing users to select a module from the catalog and install it in an empty slot
- [x] 6.4 Add an uninstall/delete action button next to occupied module bays to remove installed modules
