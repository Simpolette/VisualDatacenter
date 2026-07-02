## ADDED Requirements

### Requirement: Configure module bays on DeviceType
The system SHALL allow defining module bay templates on a DeviceType, which represent expansion slots where modules can be installed.

#### Scenario: Create a DeviceType with module bay templates
- **WHEN** a POST request is made to `/api/v1/device-types` with a list of module bay templates
- **THEN** the system SHALL create the DeviceType along with its associated module bay templates

### Requirement: Manage ModuleType catalog
The system SHALL support a catalog of ModuleTypes, which act as blueprints for expansion cards and define the ports (interfaces, console, power) they provide.

#### Scenario: Create a ModuleType
- **WHEN** a POST request is made to `/api/v1/module-types` with a list of component templates (interfaces, console ports, power ports)
- **THEN** the system SHALL create the ModuleType and save its component templates

### Requirement: Auto-instantiate empty module bays on Device placement
The system SHALL automatically instantiate physical empty module bays on a Device when it is created, using the module bay templates defined on its DeviceType.

#### Scenario: Auto-creation of module bays upon device placement
- **WHEN** a Device is created and assigned to a rack unit
- **THEN** the system SHALL create empty ModuleBay records corresponding to the module bay templates of its DeviceType

### Requirement: Install Module into ModuleBay
The system SHALL support installing a Module (derived from a ModuleType) into an empty ModuleBay of a Device. When installed, all component templates on the ModuleType SHALL be instantiated on the Device and associated with that specific Module.

#### Scenario: Success install module in slot
- **WHEN** a POST request is made to `/api/v1/devices/{deviceId}/bays/{bayId}/install` with a `moduleTypeId`
- **THEN** the system SHALL create a Module record, associate it with the ModuleBay, and instantiate all associated ports on the parent Device marked with the new Module ID

#### Scenario: Prevent install in occupied slot
- **WHEN** a POST request is made to install a Module into a ModuleBay that already has an installed module
- **THEN** the system SHALL reject the request with a conflict (409) status code

### Requirement: Uninstall Module from ModuleBay
The system SHALL support uninstalling a Module from a ModuleBay. Uninstalling a Module SHALL delete the Module record and all live ports associated with it, freeing up the ModuleBay.

#### Scenario: Success uninstall module
- **WHEN** a DELETE request is made to `/api/v1/devices/{deviceId}/modules/{moduleId}`
- **THEN** the system SHALL delete the Module record, delete all live interface, console, and power port records associated with that Module ID, and set the ModuleBay's installed module reference to NULL
