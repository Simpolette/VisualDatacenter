-- V3__User_Room_Assignments.sql
-- Create table for storing user room access assignments linking Keycloak user UUIDs to room IDs

CREATE TABLE user_room_assignments (
    keycloak_user_id UUID NOT NULL,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    assigned_by UUID,
    PRIMARY KEY (keycloak_user_id, room_id)
);

CREATE INDEX idx_user_room_assignments_room_id ON user_room_assignments(room_id);
