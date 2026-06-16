package com.simpolette.dcv.DcvServerApplication.common.exception;

public class ResourceNotFoundException extends RuntimeException {

    private final String entityName;
    private final Object entityId;

    public ResourceNotFoundException(String entityName, Object entityId) {
        super(entityName + " not found with id: " + entityId);
        this.entityName = entityName;
        this.entityId = entityId;
    }

    public String getEntityName() {
        return entityName;
    }

    public Object getEntityId() {
        return entityId;
    }
}
