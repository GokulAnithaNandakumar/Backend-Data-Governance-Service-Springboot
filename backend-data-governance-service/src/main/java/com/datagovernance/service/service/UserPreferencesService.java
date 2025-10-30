package com.datagovernance.service.service;

import com.datagovernance.service.document.UserPreferences;
import com.datagovernance.service.dto.UpdatePreferencesRequest;
import com.datagovernance.service.dto.UserPreferencesResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.exception.ResourceNotFoundException;
import com.datagovernance.service.repository.UserPreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for managing User Preferences
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserPreferencesService {

    private final UserPreferencesRepository userPreferencesRepository;
    private final UserProfileService userProfileService;

    /**
     * Creates or updates user preferences
     */
    @Transactional
    public UserPreferencesResponse updatePreferences(String userId, UpdatePreferencesRequest request) {
        log.info("Updating preferences for user ID: {}", userId);

        // Business Rule 10: Preference Integrity Check
        // User Existence Check
        if (!userProfileService.isUserActiveById(userId)) {
            UserPreferencesResponse existsButInactive = null;
            try {
                // Check if user exists but is inactive
                userProfileService.getUserById(userId);
            } catch (ResourceNotFoundException e) {
                // User doesn't exist at all
                throw new ResourceNotFoundException("User", userId);
            }
            // If we get here, user exists but is soft-deleted
            throw new BusinessRuleViolationException("Cannot update preferences for inactive user");
        }

        // Find existing preferences or create new ones
        UserPreferences preferences = userPreferencesRepository.findByUserIdAndNotDeleted(userId)
                .orElse(new UserPreferences());

        // Set user ID if this is a new preferences document
        preferences.setUserId(userId);

        // Update preferences fields if provided
        if (request.getTheme() != null) {
            preferences.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null) {
            preferences.setLanguage(request.getLanguage());
        }
        if (request.getEmailNotifications() != null) {
            preferences.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getPushNotifications() != null) {
            preferences.setPushNotifications(request.getPushNotifications());
        }
        if (request.getSmsNotifications() != null) {
            preferences.setSmsNotifications(request.getSmsNotifications());
        }
        if (request.getProfileVisible() != null) {
            preferences.setProfileVisible(request.getProfileVisible());
        }
        if (request.getShowEmail() != null) {
            preferences.setShowEmail(request.getShowEmail());
        }
        if (request.getShowLastSeen() != null) {
            preferences.setShowLastSeen(request.getShowLastSeen());
        }
        if (request.getContentFilter() != null) {
            preferences.setContentFilter(request.getContentFilter());
        }
        if (request.getCustomSettings() != null) {
            // Update custom settings
            if (preferences.getCustomSettings() == null) {
                preferences.setCustomSettings(request.getCustomSettings());
            } else {
                preferences.getCustomSettings().putAll(request.getCustomSettings());
            }
        }

        UserPreferences savedPreferences = userPreferencesRepository.save(preferences);
        log.info("Preferences updated successfully for user ID: {}", userId);

        return mapToResponse(savedPreferences);
    }

    /**
     * Retrieves user preferences by user ID
     */
    public UserPreferencesResponse getPreferences(String userId) {
        log.info("Retrieving preferences for user ID: {}", userId);

        // Business Rule 10: Check if user exists and is active
        if (!userProfileService.isUserActiveById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        UserPreferences preferences = userPreferencesRepository.findByUserIdAndNotDeleted(userId)
                .orElse(createDefaultPreferences(userId));

        return mapToResponse(preferences);
    }

    /**
     * Creates default preferences for a user
     */
    private UserPreferences createDefaultPreferences(String userId) {
        UserPreferences preferences = new UserPreferences();
        preferences.setUserId(userId);
        // Default values are already set in the UserPreferences entity
        return preferences;
    }

    /**
     * Maps UserPreferences entity to UserPreferencesResponse DTO
     */
    private UserPreferencesResponse mapToResponse(UserPreferences preferences) {
        UserPreferencesResponse response = new UserPreferencesResponse();
        response.setId(preferences.getId());
        response.setUserId(preferences.getUserId());
        response.setTheme(preferences.getTheme());
        response.setLanguage(preferences.getLanguage());
        response.setEmailNotifications(preferences.isEmailNotifications());
        response.setPushNotifications(preferences.isPushNotifications());
        response.setSmsNotifications(preferences.isSmsNotifications());
        response.setProfileVisible(preferences.isProfileVisible());
        response.setShowEmail(preferences.isShowEmail());
        response.setShowLastSeen(preferences.isShowLastSeen());
        response.setContentFilter(preferences.getContentFilter());
        response.setCustomSettings(preferences.getCustomSettings());
        response.setCreatedAt(preferences.getCreatedAt());
        response.setUpdatedAt(preferences.getUpdatedAt());
        return response;
    }
}