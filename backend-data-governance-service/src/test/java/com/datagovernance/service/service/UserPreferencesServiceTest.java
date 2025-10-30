package com.datagovernance.service.service;

import com.datagovernance.service.document.UserPreferences;
import com.datagovernance.service.dto.UpdatePreferencesRequest;
import com.datagovernance.service.dto.UserPreferencesResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.exception.ResourceNotFoundException;
import com.datagovernance.service.repository.UserPreferencesRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit Tests for UserPreferencesService - Based on Actual API
 * Tests FR6-FR7: User Preferences Management
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserPreferencesService Tests - FR6-FR7")
class UserPreferencesServiceTest {

    @Mock
    private UserPreferencesRepository userPreferencesRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserPreferencesService userPreferencesService;

    private UpdatePreferencesRequest updatePreferencesRequest;
    private UserPreferences userPreferences;
    private String userId = "test-user-id";

    @BeforeEach
    void setUp() {
        // Create test data based on actual structure
        updatePreferencesRequest = new UpdatePreferencesRequest();
        updatePreferencesRequest.setTheme("dark");
        updatePreferencesRequest.setLanguage("en-US");
        updatePreferencesRequest.setEmailNotifications(true);
        updatePreferencesRequest.setPushNotifications(false);
        updatePreferencesRequest.setSmsNotifications(false);
        updatePreferencesRequest.setProfileVisible(true);
        updatePreferencesRequest.setShowEmail(false);
        updatePreferencesRequest.setShowLastSeen(true);
        updatePreferencesRequest.setContentFilter("moderate");

        Map<String, Object> customSettings = new HashMap<>();
        customSettings.put("darkModeSchedule", "auto");
        updatePreferencesRequest.setCustomSettings(customSettings);

        userPreferences = new UserPreferences();
        userPreferences.setId("preferences-id");
        userPreferences.setUserId(userId);
        userPreferences.setTheme("dark");
        userPreferences.setLanguage("en-US");
        userPreferences.setEmailNotifications(true);
        userPreferences.setPushNotifications(false);
        userPreferences.setSmsNotifications(false);
        userPreferences.setProfileVisible(true);
        userPreferences.setShowEmail(false);
        userPreferences.setShowLastSeen(true);
        userPreferences.setContentFilter("moderate");
        userPreferences.setCustomSettings(customSettings);
        userPreferences.setCreatedAt(LocalDateTime.now());
        userPreferences.setUpdatedAt(LocalDateTime.now());
    }

    // ==========================================
    // FR6: UPDATE PREFERENCES - PUT /api/v1/users/{userId}/preferences
    // ==========================================

    @Test
    @DisplayName("FR6: Update User Preferences - Success (200 OK)")
    void testUpdatePreferences_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.updatePreferences(userId, updatePreferencesRequest);

        // Assert
        assertNotNull(response);
        assertEquals(userId, response.getUserId());
        assertEquals("dark", response.getTheme());
        assertEquals("en-US", response.getLanguage());
        assertTrue(response.isEmailNotifications());
        assertFalse(response.isPushNotifications());
        assertFalse(response.isSmsNotifications());
        assertTrue(response.isProfileVisible());
        assertFalse(response.isShowEmail());
        assertTrue(response.isShowLastSeen());
        assertEquals("moderate", response.getContentFilter());
        assertNotNull(response.getCustomSettings());

        verify(userProfileService).isUserActiveById(userId);
        verify(userPreferencesRepository).findByUserIdAndNotDeleted(userId);
        verify(userPreferencesRepository).save(any(UserPreferences.class));
    }

    @Test
    @DisplayName("FR6: Create New Preferences - First Time Setup (200 OK)")
    void testUpdatePreferences_CreateNew() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.empty());
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.updatePreferences(userId, updatePreferencesRequest);

        // Assert
        assertNotNull(response);
        assertEquals(userId, response.getUserId());

        verify(userProfileService).isUserActiveById(userId);
        verify(userPreferencesRepository).findByUserIdAndNotDeleted(userId);
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getUserId().equals(userId) &&
                prefs.getTheme().equals("dark")));
    }

    @Test
    @DisplayName("FR6: Update Preferences - Inactive User (Exception)")
    void testUpdatePreferences_InactiveUser() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(false);

        // Act & Assert
        assertThrows(Exception.class, () -> {
            userPreferencesService.updatePreferences(userId, updatePreferencesRequest);
        });

        verify(userProfileService).isUserActiveById(userId);
        verify(userPreferencesRepository, never()).findByUserIdAndNotDeleted(anyString());
        verify(userPreferencesRepository, never()).save(any(UserPreferences.class));
    }

    // ==========================================
    // FR7: GET PREFERENCES - GET /api/v1/users/{userId}/preferences
    // ==========================================

    @Test
    @DisplayName("FR7: Get User Preferences - Success (200 OK)")
    void testGetPreferences_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));

        // Act
        UserPreferencesResponse response = userPreferencesService.getPreferences(userId);

        // Assert
        assertNotNull(response);
        assertEquals(userId, response.getUserId());
        assertEquals("dark", response.getTheme());
        assertEquals("en-US", response.getLanguage());
        assertTrue(response.isEmailNotifications());
        assertFalse(response.isPushNotifications());
        assertEquals("moderate", response.getContentFilter());

        verify(userProfileService).isUserActiveById(userId);
        verify(userPreferencesRepository).findByUserIdAndNotDeleted(userId);
    }

    @Test
    @DisplayName("FR7: Get Preferences - Default Values for New User (200 OK)")
    void testGetPreferences_DefaultValues() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.empty());

        // Act
        UserPreferencesResponse response = userPreferencesService.getPreferences(userId);

        // Assert
        assertNotNull(response);
        assertEquals(userId, response.getUserId());
        assertEquals("light", response.getTheme()); // Default theme
        assertEquals("en", response.getLanguage()); // Default language
        assertTrue(response.isEmailNotifications()); // Default email notifications
        assertTrue(response.isPushNotifications()); // Default push notifications
        assertFalse(response.isSmsNotifications()); // Default SMS notifications
        assertTrue(response.isProfileVisible()); // Default profile visibility
        assertFalse(response.isShowEmail()); // Default show email
        assertTrue(response.isShowLastSeen()); // Default show last seen
        assertEquals("moderate", response.getContentFilter()); // Default content filter

        verify(userProfileService).isUserActiveById(userId);
        verify(userPreferencesRepository).findByUserIdAndNotDeleted(userId);
    }

    @Test
    @DisplayName("FR7: Get Preferences - Inactive User (404 Not Found)")
    void testGetPreferences_InactiveUser() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userPreferencesService.getPreferences(userId);
        });

        assertTrue(exception.getMessage().contains("not found"));
        verify(userProfileService).isUserActiveById(userId);
        verify(userPreferencesRepository, never()).findByUserIdAndNotDeleted(anyString());
    }

    // ==========================================
    // VALIDATION AND EDGE CASES
    // ==========================================

    @Test
    @DisplayName("Validation: Theme Values")
    void testUpdatePreferences_ValidThemeValues() {
        // Test different theme values
        String[] validThemes = { "light", "dark", "auto" };

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        for (String theme : validThemes) {
            // Arrange
            updatePreferencesRequest.setTheme(theme);

            // Act
            UserPreferencesResponse response = userPreferencesService.updatePreferences(userId,
                    updatePreferencesRequest);

            // Assert
            assertNotNull(response);
        }
    }

    @Test
    @DisplayName("Validation: Language Format")
    void testUpdatePreferences_ValidLanguageFormats() {
        // Arrange
        updatePreferencesRequest.setLanguage("es-ES");
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.updatePreferences(userId, updatePreferencesRequest);

        // Assert
        assertNotNull(response);
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getLanguage().equals("es-ES")));
    }

    @Test
    @DisplayName("Validation: Content Filter Values")
    void testUpdatePreferences_ValidContentFilters() {
        // Test all valid content filter values
        String[] validFilters = { "strict", "moderate", "off" };

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        for (String filter : validFilters) {
            // Arrange
            updatePreferencesRequest.setContentFilter(filter);

            // Act
            UserPreferencesResponse response = userPreferencesService.updatePreferences(userId,
                    updatePreferencesRequest);

            // Assert
            assertNotNull(response);
        }
    }

    @Test
    @DisplayName("Edge Case: Notification Settings Combinations")
    void testUpdatePreferences_NotificationCombinations() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        // Test: All notifications enabled
        updatePreferencesRequest.setEmailNotifications(true);
        updatePreferencesRequest.setPushNotifications(true);
        updatePreferencesRequest.setSmsNotifications(true);

        UserPreferencesResponse response1 = userPreferencesService.updatePreferences(userId, updatePreferencesRequest);
        assertNotNull(response1);

        // Test: All notifications disabled
        updatePreferencesRequest.setEmailNotifications(false);
        updatePreferencesRequest.setPushNotifications(false);
        updatePreferencesRequest.setSmsNotifications(false);

        UserPreferencesResponse response2 = userPreferencesService.updatePreferences(userId, updatePreferencesRequest);
        assertNotNull(response2);
    }

    @Test
    @DisplayName("Edge Case: Privacy Settings Combinations")
    void testUpdatePreferences_PrivacySettings() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        // Test: All privacy settings disabled
        updatePreferencesRequest.setProfileVisible(false);
        updatePreferencesRequest.setShowEmail(false);
        updatePreferencesRequest.setShowLastSeen(false);

        UserPreferencesResponse response = userPreferencesService.updatePreferences(userId, updatePreferencesRequest);

        assertNotNull(response);
        verify(userPreferencesRepository).save(argThat(prefs -> !prefs.isProfileVisible() &&
                !prefs.isShowEmail() &&
                !prefs.isShowLastSeen()));
    }

    @Test
    @DisplayName("Edge Case: Custom Settings")
    void testUpdatePreferences_CustomSettings() {
        // Arrange
        Map<String, Object> customSettings = new HashMap<>();
        customSettings.put("customTheme", "neon");
        customSettings.put("fontSize", 14);
        customSettings.put("autoSave", true);
        updatePreferencesRequest.setCustomSettings(customSettings);

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.updatePreferences(userId, updatePreferencesRequest);

        // Assert
        assertNotNull(response);
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getCustomSettings() != null &&
                prefs.getCustomSettings().containsKey("customTheme")));
    }

    @Test
    @DisplayName("Edge Case: Partial Update - Only Theme Changed")
    void testUpdatePreferences_PartialUpdate() {
        // Arrange
        UpdatePreferencesRequest partialRequest = new UpdatePreferencesRequest();
        partialRequest.setTheme("light"); // Only updating theme

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPreferencesRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Optional.of(userPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(userPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.updatePreferences(userId, partialRequest);

        // Assert
        assertNotNull(response);
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getTheme().equals("light") &&
                prefs.getLanguage().equals("en-US") // Original value preserved
        ));
    }
}