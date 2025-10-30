package com.datagovernance.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for operation acknowledgment responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperationAcknowledgmentResponse {

    private String message;
    private String operationType;
    private String resourceId;
    private LocalDateTime timestamp;
    private boolean success;

    public static OperationAcknowledgmentResponse success(String operationType, String resourceId, String message) {
        return new OperationAcknowledgmentResponse(
                message,
                operationType,
                resourceId,
                LocalDateTime.now(),
                true);
    }
}