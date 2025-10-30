package com.datagovernance.service.exception;

/**
 * Exception thrown when a resource already exists (conflict)
 */
public class ResourceConflictException extends RuntimeException {

    public ResourceConflictException(String message) {
        super(message);
    }

    public ResourceConflictException(String resourceType, String field, String value) {
        super(String.format("%s with %s '%s' already exists", resourceType, field, value));
    }
}