## ADDED Requirements

### Requirement: Concurrent device polling with virtual threads
The telemetry scheduler SHALL poll all devices concurrently using Java 21 virtual threads instead of sequentially on a single thread.

#### Scenario: 10,000 devices polled within scheduler interval
- **WHEN** the scheduler triggers a telemetry collection cycle with 10,000 registered devices
- **THEN** the system SHALL complete all SNMP and Modbus polls within 5 seconds (the scheduler interval) under normal network conditions

#### Scenario: Virtual thread per device
- **WHEN** the scheduler starts a collection cycle
- **THEN** the system SHALL submit each device poll as a separate task to a virtual thread executor, allowing all polls to execute concurrently

### Requirement: Shared SNMP transport
The `SnmpPollerService` SHALL use a single shared `Snmp` instance with one `DefaultUdpTransportMapping` for all SNMP polls.

#### Scenario: SNMP session created at startup
- **WHEN** the `SnmpPollerService` bean is initialized
- **THEN** the service SHALL create one `DefaultUdpTransportMapping`, start listening, and create one `Snmp` instance wrapping that transport

#### Scenario: SNMP session reused across polls
- **WHEN** multiple virtual threads poll different devices simultaneously
- **THEN** all threads SHALL use the same `Snmp` instance, with SNMP4J correlating responses by PDU request ID internally

#### Scenario: SNMP session closed on shutdown
- **WHEN** the Spring application context shuts down
- **THEN** the `SnmpPollerService` SHALL close the shared `Snmp` instance and its transport mapping

### Requirement: Graceful handling of poll failures
The system SHALL handle individual device poll failures without affecting other devices in the same cycle.

#### Scenario: Single device timeout
- **WHEN** one device fails to respond within the SNMP timeout (2000ms)
- **THEN** that device's metrics SHALL be empty for the cycle, and all other devices' metrics SHALL still be collected and processed normally

#### Scenario: Device poll throws exception
- **WHEN** a device poll throws an unexpected exception
- **THEN** the exception SHALL be caught and logged, and the remaining devices SHALL continue polling unaffected
