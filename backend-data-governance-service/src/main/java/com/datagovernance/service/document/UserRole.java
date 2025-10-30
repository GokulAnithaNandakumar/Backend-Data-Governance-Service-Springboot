package com.datagovernance.service.document;

/**
 * Enumeration of user roles for permission validation
 */
public enum UserRole {
    ADMIN("Administrator"),
    USER("Regular User"),
    MODERATOR("Content Moderator"),
    GUEST("Guest User");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}