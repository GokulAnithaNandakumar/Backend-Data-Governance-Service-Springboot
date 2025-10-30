package com.datagovernance.service.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Audit trail entry for tracking operations
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditEntry {

    private String action;
    private LocalDateTime timestamp;
    private String details;
    private String performedBy;

    public static AuditEntry create(String action, String details, String performedBy) {
        return new AuditEntry(action, LocalDateTime.now(), details, performedBy);
    }

    public static AuditEntry create(String action, String details) {
        return create(action, details, "SYSTEM");
    }
}