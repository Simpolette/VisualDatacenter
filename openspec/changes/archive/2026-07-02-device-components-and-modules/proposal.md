## Why

The current system only supports basic device metadata (height, width, weight, category) and lacks the ability to model individual hardware ports (network interfaces, console connections, power inlets) or pluggable hardware expansion modules (line cards, interfaces modules, power supplies). To support detailed device configurations and represent complex, modular IT infrastructure in server racks, the database schema needs to separate static component templates from live component instances, and introduce module slots (module bays) that host dynamic, card-specific ports.

## What Changes

* **Hardware Catalog Expansion**: Extend the device type catalog to support defining blueprints/templates for ports (interfaces, console ports, power ports) and module slot positions.
* **Module Template Definitions**: Introduce templates for modules (`ModuleType`) defining the network, power, and console ports that the module provides when installed.
* **Component Instance Tracking**: Track physical component instances (live interfaces, console connections, and power inlets) on actual devices, linked either directly to the device or to an installed module.
* **Modular Bay Management**: Allow devices to have physical slots (`ModuleBay`) where specific hardware modules can be dynamically installed, updated, or removed, automatically managing the lifecycle of the ports they provide.

## Capabilities

### New Capabilities

- `device-component-templates`: Allows users and seeds to define console port, power port, and interface templates for device types in the hardware catalog.
- `modular-device-architecture`: Supports configuring module bays on device types, defining module types, and installing/uninstalling modules in live devices (automatically instantiating or purging corresponding live ports).

### Modified Capabilities

- None

## Impact

* **Database**: New tables for templates (`interface_template`, `power_port_template`, `console_port_template`, `module_bay_template`, `module_type`) and live instances (`interface`, `power_port`, `console_port`, `module_bay`, `module`).
* **Backend API**:
  * New CRUD endpoints for managing module types (`/api/v1/module-types`).
  * Extended `/api/v1/device-types` endpoints to include component templates.
  * Extended `/api/v1/devices` and new `/api/v1/devices/{id}/modules` endpoints to list/manage installed modules.
* **Frontend**:
  * Rack and Device detail sidebar updates to show ports, slots, and installed modules.
  * A dialog/form to select and install a module into an empty module bay on a device.
