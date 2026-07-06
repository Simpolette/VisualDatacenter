## ADDED Requirements

### Requirement: Per-Device Network Connection Resolution
The system SHALL resolve polling target connection parameters (`ipAddress`, `port`, `snmpCommunity`) dynamically for each installed device. If device-specific network parameters are omitted or blank, the system SHALL fall back to global default configuration properties (`telemetry.snmp.host`, `telemetry.snmp.port`, `telemetry.snmp.community`, `telemetry.modbus.host`, `telemetry.modbus.port`).

#### Scenario: Device with custom IP and Port configured
- **WHEN** the scheduled poller executes for a device with explicit `ipAddress` and `port` values
- **THEN** the poller SHALL initiate socket connections directly to the specified IP and Port

#### Scenario: Fallback to default network configuration
- **WHEN** the scheduled poller executes for a device with `null` or blank network fields
- **THEN** the poller SHALL fall back to configured default telemetry environment variables

### Requirement: SNMP Device Metric Polling with Template OIDs
The system SHALL execute background polling jobs at configured intervals (default 5 seconds) to query SNMP OIDs from active server devices over UDP and record system metrics. OIDs SHALL be dynamically resolved from the device's associated `DeviceType` template (`oidUptime`, `oidCpu`, `oidRam`, `oidNetwork`, `oidTemp`), falling back to standard MIB defaults if custom OIDs are omitted. The system SHALL listen exclusively to live SNMP server responses without generating mock fallback metrics.

#### Scenario: Successful SNMP telemetry poll
- **WHEN** the scheduled poller connects to an active SNMP agent endpoint for a server device
- **THEN** the system SHALL normalize OID strings, parse returned variable bindings, and record metric values with timestamps in telemetry storage

#### Scenario: SNMP connection failure
- **WHEN** an SNMP agent endpoint is unreachable or times out after 2000ms
- **THEN** the system SHALL log a polling failure error and return an empty metrics result without generating fallback telemetry values

### Requirement: Modbus TCP UPS Metric Polling
The system SHALL query Modbus TCP holding registers (Function Code 3) over a raw TCP socket connection from UPS devices to monitor battery level percentage, input voltage, output voltage, UPS load percentage, and temperature. The system SHALL listen exclusively to live Modbus server responses without generating mock fallback metrics.

#### Scenario: Successful Modbus register read
- **WHEN** the scheduled poller connects to a Modbus TCP server and reads register addresses 0-4
- **THEN** the system SHALL convert raw 16-bit register values to floating-point telemetry metrics and save them to telemetry storage

#### Scenario: Modbus connection or frame failure
- **WHEN** a Modbus TCP endpoint is unreachable or returns an invalid frame
- **THEN** the system SHALL log a polling failure error and return an empty metrics result without generating fallback telemetry values
