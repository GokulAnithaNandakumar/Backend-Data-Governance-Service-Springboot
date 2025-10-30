package com.datagovernance.service.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;

/**
 * User Preferences document for storing user configuration settings
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "user_preferences")
public class UserPreferences extends BaseAuditDocument {

    @Id
    private String id;

    @NotNull(message = "User ID is required")
    @Indexed(unique = true)
    private String userId;

    // Theme preferences
    private String theme = "light"; // light, dark

    // Language preferences
    private String language = "en";

    // Notification preferences
    private boolean emailNotifications = true;
    private boolean pushNotifications = true;
    private boolean smsNotifications = false;

    // Privacy preferences
    private boolean profileVisible = true;
    private boolean showEmail = false;
    private boolean showLastSeen = true;

    // Content preferences
    private String contentFilter = "moderate"; // strict, moderate, off

    // Custom settings as key-value pairs for flexibility
    private Map<String, Object> customSettings = new HashMap<>();

    public void setSetting(String key, Object value) {
        if (customSettings == null) {
            customSettings = new HashMap<>();
        }
        customSettings.put(key, value);
    }

    public Object getSetting(String key) {
        return customSettings != null ? customSettings.get(key) : null;
    }

    public Object getSetting(String key, Object defaultValue) {
        Object value = getSetting(key);
        return value != null ? value : defaultValue;
    }
}