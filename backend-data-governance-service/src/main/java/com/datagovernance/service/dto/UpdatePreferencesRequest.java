package com.datagovernance.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * DTO for updating user preferences
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesRequest {

    private String theme;
    private String language;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean smsNotifications;
    private Boolean profileVisible;
    private Boolean showEmail;
    private Boolean showLastSeen;
    private String contentFilter;
    private Map<String, Object> customSettings = new HashMap<>();
}