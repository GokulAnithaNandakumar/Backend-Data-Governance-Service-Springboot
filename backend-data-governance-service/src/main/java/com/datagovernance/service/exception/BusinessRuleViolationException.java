package com.datagovernance.service.exception;

/**
 * Exception thrown when an operation is forbidden due to business rules
 */
public class BusinessRuleViolationException extends RuntimeException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }
}