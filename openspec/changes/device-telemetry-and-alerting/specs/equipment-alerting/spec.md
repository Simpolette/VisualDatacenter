## ADDED Requirements

### Requirement: Metric Threshold Alarm Generation
The system SHALL evaluate ingested metrics against predefined thresholds (e.g., CPU > 90%, UPS Battery < 20%, Temperature > 50°C) and trigger equipment alarms with severity levels WARNING or CRITICAL.

#### Scenario: Metric exceeds critical threshold
- **WHEN** an ingested metric value breaches a CRITICAL threshold rule
- **THEN** the system SHALL create an active equipment alarm entry in the database with status TRIGGERED and broadcast the event

#### Scenario: Automatic alarm resolution
- **WHEN** subsequent metric values return within normal operating boundaries
- **THEN** the system SHALL update the alarm status to RESOLVED and log the resolution timestamp

### Requirement: Alarm Querying and Acknowledgment
The system SHALL provide REST endpoints to query active alarms and update alarm status to ACKNOWLEDGED with operator notes.

#### Scenario: Operator acknowledges active alarm
- **WHEN** a user submits an acknowledgment request for an active alarm ID with an optional note
- **THEN** the system SHALL set the alarm state to ACKNOWLEDGED and persist the operator ID and timestamp
