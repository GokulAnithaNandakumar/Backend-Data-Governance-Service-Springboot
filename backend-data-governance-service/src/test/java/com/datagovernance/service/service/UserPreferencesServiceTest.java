package com.datagovernance.service.service;

import com.datagovernance.service.dto.UpdatePreferencesRequest;
import com.datagovernance.service.dto.UserPreferencesResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.document.UserPreferences;
import com.datagovernance.service.repository.UserPreferencesRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserPreferencesService
 * Tests all business rules related to FR6 and FR7
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("User Preferences Service Unit Tests")
class UserPreferencesServiceTest {

    @Mock
    private UserPreferencesRepository userPreferencesRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserPreferencesService userPreferencesService;

    private UpdatePreferencesRequest validRequest;
    private UserPreferences existingPreferences;
    private String activeUserId = "active-user-id";

    @BeforeEach
    void setUp() {
        validRequest = new UpdatePreferencesRequest();
        validRequest.setTheme("dark");
        validRequest.setLanguage("en");
        validRequest.setEmailNotifications(true);
        validRequest.setPushNotifications(false);

        existingPreferences = new UserPreferences();
        existingPreferences.setId("prefs-id");
        existingPreferences.setUserId(activeUserId);
        existingPreferences.setTheme("light");
        existingPreferences.setLanguage("en");
        existingPreferences.setEmailNotifications(false);
        existingPreferences.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("FR7: Update Preferences - Success")
    void testUpdatePreferences_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(activeUserId)).thenReturn(true);
        when(userPreferencesRepository.findByUserId(activeUserId)).thenReturn(Optional.of(existingPreferences));
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.updatePreferences(activeUserId, validRequest);

        // Assert
        assertNotNull(response);
        assertEquals(activeUserId, response.getUserId());
        verify(userProfileService).isUserActiveById(activeUserId);
        verify(userPreferencesRepository).save(any(UserPreferences.class));
    }

    @Test
    @DisplayName("FR7: Update Preferences - User Not Active")
    void testUpdatePreferences_UserNotActive() {
        // Arrange
        when(userProfileService.isUserActiveById(activeUserId)).thenReturn(false);

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> userPreferencesService.updatePreferences(activeUserId, validRequest));

        assertEquals("Cannot update preferences for inactive or non-existent user", exception.getMessage());
        verify(userPreferencesRepository, never()).save(any());
    }

    @Test
    @DisplayName("FR7: Update Preferences - Create New Preferences")
    void testUpdatePreferences_CreateNew() {
        // Arrange
        when(userProfileService.isUserActiveById(activeUserId)).thenReturn(true);
        when(userPreferencesRepository.findByUserId(activeUserId)).thenReturn(Optional.empty());
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.updatePreferences(activeUserId, validRequest);

        // Assert
        assertNotNull(response);
        verify(userPreferencesRepository).save(any(UserPreferences.class));
    }

    @Test
    @DisplayName("FR6: Get Preferences - Success")
    void testGetPreferences_Success() {
        // Arrange
        when(userPreferencesRepository.findByUserId(activeUserId)).thenReturn(Optional.of(existingPreferences));

        // Act
        UserPreferencesResponse response = userPreferencesService.getPreferences(activeUserId);

        // Assert
        assertNotNull(response);
        assertEquals(activeUserId, response.getUserId());
        assertEquals("light", response.getTheme());
        verify(userPreferencesRepository).findByUserId(activeUserId);
    }

    @Test
    @DisplayName("FR6: Get Preferences - Create Default")
    void testGetPreferences_CreateDefault() {
        // Arrange
        when(userPreferencesRepository.findByUserId(activeUserId)).thenReturn(Optional.empty());
        when(userPreferencesRepository.save(any(UserPreferences.class))).thenReturn(existingPreferences);

        // Act
        UserPreferencesResponse response = userPreferencesService.getPreferences(activeUserId);

        // Assert
        assertNotNull(response);
        verify(userPreferencesRepository).save(any(UserPreferences.class));
    }
}