package com.datagovernance.service.service;

import com.datagovernance.service.document.UserPreferences;
import com.datagovernance.service.dto.UpdatePreferencesRequest;
import com.datagovernance.service.dto.UserPreferencesResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit Tests for UserPreferencesService
 * Covers Business Rule 10 from PRD
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserPreferencesService - Business Rules Validation")
class ComprehensiveUserPreferencesServiceTest {

    @Mock
    private UserPreferencesRepository userPreferencesRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserPreferencesService userPreferencesService;

    private UpdatePreferencesRequest validUpdateRequest;
    private UserPreferences existingPreferences;
    private String testUserId = "test-user-id";
    private String preferencesId = "preferences-id";

    @BeforeEach
    void setUp() {
        // Setup valid update request
        validUpdateRequest = new UpdatePreferencesRequest();
        validUpdateRequest.setTheme("dark");
        validUpdateRequest.setLanguage("en");
        validUpdateRequest.setEmailNotifications(true);
        validUpdateRequest.setPushNotifications(false);
        validUpdateRequest.setSmsNotifications(false);
        validUpdateRequest.setProfileVisible(true);
        validUpdateRequest.setShowEmail(false);
        validUpdateRequest.setShowLastSeen(true);
        validUpdateRequest.setContentFilter("moderate");

        Map<String, Object> customSettings = new HashMap<>();
        customSettings.put("autoSave", true);
        customSettings.put("fontSize", 14);
        validUpdateRequest.setCustomSettings(customSettings);

        // Setup existing preferences
        existingPreferences = new UserPreferences();
        existingPreferences.setId(preferencesId);
        existingPreferences.setUserId(testUserId);
        existingPreferences.setTheme("light");
        existingPreferences.setLanguage("en");
        existingPreferences.setEmailNotifications(false);
        existingPreferences.setPushNotifications(true);
        existingPreferences.setSmsNotifications(false);
        existingPreferences.setProfileVisible(true);
        existingPreferences.setShowEmail(true);
        existingPreferences.setShowLastSeen(false);
        existingPreferences.setContentFilter("strict");
        existingPreferences.setCustomSettings(new HashMap<>());
        existingPreferences.setCreatedAt(LocalDateTime.now().minusDays(1));
        existingPreferences.setUpdatedAt(LocalDateTime.now().minusDays(1));
    }

    // ==========================================
    // FR6: UPDATE PREFERENCES - Business Rule 10
    // ==========================================

    @Test
    @DisplayName("FR6: Update Preferences - Success with Business Rule 6: Timestamp Enforcement")
    void testUpdatePreferences_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.of(existingPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse result = userPreferencesService.updatePreferences(testUserId, validUpdateRequest);

        // Assert
        assertNotNull(result);
        assertEquals(testUserId, result.getUserId());

        // Verify Business Rule 10: User Existence and Active Check
        verify(userProfileService).isUserActiveById(testUserId);

        // Verify Business Rule 6: Timestamp enforcement
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getUserId().equals(testUserId) &&
                prefs.getTheme().equals("dark") &&
                prefs.getLanguage().equals("en") &&
                prefs.isEmailNotifications() &&
                !prefs.isPushNotifications() &&
                !prefs.isSmsNotifications() &&
                prefs.isProfileVisible() &&
                !prefs.isShowEmail() &&
                prefs.isShowLastSeen() &&
                prefs.getContentFilter().equals("moderate") &&
                prefs.getUpdatedAt() != null));
    }

    @Test
    @DisplayName("Business Rule 10: Preference Integrity Check - User Not Found")
    void testUpdatePreferences_UserNotFound() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(false);

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> userPreferencesService.updatePreferences(testUserId, validUpdateRequest));

        assertEquals("Cannot update preferences for inactive user", exception.getMessage());
        verify(userPreferencesRepository, never()).save(any());
        verify(userPreferencesRepository, never()).findByUserId(anyString());
    }

    @Test
    @DisplayName("FR6: Update Preferences - Create New When None Exist")
    void testUpdatePreferences_CreateNew() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse result = userPreferencesService.updatePreferences(testUserId, validUpdateRequest);

        // Assert
        assertNotNull(result);

        // Verify new preferences created with Business Rule 6: Timestamp enforcement
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getUserId().equals(testUserId) &&
                prefs.getCreatedAt() != null &&
                prefs.getUpdatedAt() != null));
    }

    @Test
    @DisplayName("FR6: Update Preferences - Custom Settings Handling")
    void testUpdatePreferences_CustomSettingsHandling() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.of(existingPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse result = userPreferencesService.updatePreferences(testUserId, validUpdateRequest);

        // Assert
        assertNotNull(result);

        // Verify custom settings are properly handled
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getCustomSettings() != null &&
                prefs.getCustomSettings().containsKey("autoSave") &&
                prefs.getCustomSettings().containsKey("fontSize") &&
                (Boolean) prefs.getCustomSettings().get("autoSave") &&
                (Integer) prefs.getCustomSettings().get("fontSize") == 14));
    }

    // ==========================================
    // FR7: GET PREFERENCES
    // ==========================================

    @Test
    @DisplayName("FR7: Get Preferences - Success")
    void testGetPreferences_Success() {
        // Arrange
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.of(existingPreferences));

        // Act
        UserPreferencesResponse result = userPreferencesService.getPreferences(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(testUserId, result.getUserId());
        assertEquals(preferencesId, result.getId());
        assertEquals("light", result.getTheme());
        assertEquals("en", result.getLanguage());
        assertFalse(result.isEmailNotifications());
        assertTrue(result.isPushNotifications());
        verify(userPreferencesRepository).findByUserId(testUserId);
    }

    @Test
    @DisplayName("FR7: Get Preferences - Create Default When None Exist")
    void testGetPreferences_CreateDefault() {
        // Arrange
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.empty());
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse result = userPreferencesService.getPreferences(testUserId);

        // Assert
        assertNotNull(result);

        // Verify default preferences created with proper defaults
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getUserId().equals(testUserId) &&
                prefs.getTheme().equals("light") && // Default theme
                prefs.getLanguage().equals("en") && // Default language
                prefs.isEmailNotifications() && // Default email notifications on
                !prefs.isPushNotifications() && // Default push notifications off
                !prefs.isSmsNotifications() && // Default SMS notifications off
                prefs.isProfileVisible() && // Default profile visible
                !prefs.isShowEmail() && // Default don't show email
                !prefs.isShowLastSeen() && // Default don't show last seen
                prefs.getContentFilter().equals("moderate") && // Default content filter
                prefs.getCreatedAt() != null &&
                prefs.getUpdatedAt() != null));
    }

    // ==========================================
    // Edge Cases and Validation Tests
    // ==========================================

    @Test
    @DisplayName("Update Preferences - Partial Update")
    void testUpdatePreferences_PartialUpdate() {
        // Arrange - Only update some fields
        UpdatePreferencesRequest partialRequest = new UpdatePreferencesRequest();
        partialRequest.setTheme("dark");
        partialRequest.setEmailNotifications(false);
        // Leave other fields null

        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.of(existingPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse result = userPreferencesService.updatePreferences(testUserId, partialRequest);

        // Assert
        assertNotNull(result);

        // Verify only non-null fields are updated
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getTheme().equals("dark") && // Updated
                !prefs.isEmailNotifications() && // Updated
                prefs.getLanguage().equals("en") && // Preserved from existing
                prefs.isPushNotifications() && // Preserved from existing
                prefs.getContentFilter().equals("strict") // Preserved from existing
        ));
    }

    @Test
    @DisplayName("Update Preferences - Null Custom Settings Handling")
    void testUpdatePreferences_NullCustomSettings() {
        // Arrange
        validUpdateRequest.setCustomSettings(null);

        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.of(existingPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse result = userPreferencesService.updatePreferences(testUserId, validUpdateRequest);

        // Assert
        assertNotNull(result);

        // Verify null custom settings are handled gracefully
        verify(userPreferencesRepository).save(argThat(prefs -> prefs.getCustomSettings() != null // Should preserve
                                                                                                  // existing or create
                                                                                                  // empty map
        ));
    }

    @Test
    @DisplayName("Get Preferences - Response Mapping Accuracy")
    void testGetPreferences_ResponseMappingAccuracy() {
        // Arrange
        existingPreferences.getCustomSettings().put("testKey", "testValue");
        when(userPreferencesRepository.findByUserId(testUserId)).thenReturn(Optional.of(existingPreferences));

        // Act
        UserPreferencesResponse result = userPreferencesService.getPreferences(testUserId);

        // Assert - Verify all fields are correctly mapped
        assertEquals(preferencesId, result.getId());
        assertEquals(testUserId, result.getUserId());
        assertEquals("light", result.getTheme());
        assertEquals("en", result.getLanguage());
        assertFalse(result.isEmailNotifications());
        assertTrue(result.isPushNotifications());
        assertFalse(result.isSmsNotifications());
        assertTrue(result.isProfileVisible());
        assertTrue(result.isShowEmail());
        assertFalse(result.isShowLastSeen());
        assertEquals("strict", result.getContentFilter());
        assertEquals("testValue", result.getCustomSettings().get("testKey"));
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }
}