package com.datagovernance.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for user preferences response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesResponse {

    private String id;
    private String userId;
    private String theme;
    private String language;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean smsNotifications;
    private boolean profileVisible;
    private boolean showEmail;
    private boolean showLastSeen;
    private String contentFilter;
    private Map<String, Object> customSettings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}