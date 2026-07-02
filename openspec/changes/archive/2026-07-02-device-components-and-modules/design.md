## Context

The application currently has a flat device type catalog and flat device instances. To support modular hardware (like network switches with expansion slots, servers with PCIe cards, or PDUs with custom outlets), we must design a database schema that supports static templates for ports/slots, and instantiates live components dynamically, especially when physical cards (modules) are inserted into slots (module bays).

## Goals / Non-Goals

**Goals:**
* Define static catalog templates for interfaces, power ports, console ports, and module bays on `DeviceType`.
* Define catalog templates for `ModuleType` and its associated components.
* Support instantiating live interfaces, power ports, and console ports on `Device` creation.
* Support instantiating physical empty `ModuleBay` slots on `Device` creation.
* Support installing a card (`Module`) into a `ModuleBay`, dynamically injecting its ports into the parent `Device`.
* Support uninstalling a card, purging its ports without affecting the parent device's other components.

**Non-Goals:**
* Simulating patch panels or cross-connections/cabling between ports (cabling is out of scope).
* Calculating dynamic power load or network bandwidth consumption.
* Role-based permissions for hardware inventory modifications.

## Decisions

### 1. Separate Component Tables vs. Unified Component Table
* **Decision**: Create separate tables/entities for `Interface`, `PowerPort`, and `ConsolePort` instead of a generic `DeviceComponent` table.
* **Rationale**: Network interfaces, power ports, and console connections have significantly different metadata and behaviors. Interfaces require IP configurations and link speeds, power ports track wattage, and console ports track connection types. Storing them in a single generic table leads to sparse columns and forces complex typecasting in application code.

### 2. Dual-Level Port Ownership
* **Decision**: Live components (such as `Interface`) will have foreign keys to both `Device` (`device_id`) and `Module` (`module_id`, nullable).
* **Rationale**: 
  * Having `device_id` makes queries for "all interfaces on device X" fast and simple without requiring recursive joins through module tables.
  * Having `module_id` makes it trivial to delete all card-specific ports when a card is uninstalled, simply by querying and deleting where `module_id = ?`.

### 3. Port Name Collision Mitigation
* **Decision**: When instantiating ports from a module template, port names will be prefixed with the module bay slot position if a name conflict with an existing device port is detected.
* **Rationale**: If a Device already has a port named `GigabitEthernet1` and a module template also declares `GigabitEthernet1`, we prefix it (e.g., `Slot1/GigabitEthernet1`) to maintain the database invariant of unique port names per device.

## Risks / Trade-offs

* **Risk**: Cascading deletes of modules could accidentally delete device-level ports.
  * *Mitigation*: Ensure the Hibernate entity relationship maps cascade delete exclusively to the `Module` entity, and make sure that ports created from the `DeviceType` directly have `module_id = null` and are not cascaded when a module is uninstalled.
* **Risk**: Deep entity hierarchy may cause N+1 query problems.
  * *Mitigation*: Fetch devices using specific Projection DTOs or join-fetch clauses in JPA repositories when displaying rack lists or sidebars, preventing eager loading of all ports and slots.
