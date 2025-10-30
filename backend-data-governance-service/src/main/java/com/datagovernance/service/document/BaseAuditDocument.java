package com.datagovernance.service.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

/**
 * Base audit fields for all documents
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseAuditDocument {

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private boolean deleted = false;

    private LocalDateTime deletedAt;

    public void markAsDeleted() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isActive() {
        return !deleted;
    }
}