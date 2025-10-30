package com.datagovernance.service.service;

import com.datagovernance.service.document.UserProfile;
import com.datagovernance.service.document.UserRole;
import com.datagovernance.service.dto.CreateUserRequest;
import com.datagovernance.service.dto.UpdateUserRequest;
import com.datagovernance.service.dto.UserProfileResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.exception.ResourceConflictException;
import com.datagovernance.service.exception.ResourceNotFoundException;
import com.datagovernance.service.repository.UserPostRepository;
import com.datagovernance.service.repository.UserPreferencesRepository;
import com.datagovernance.service.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserProfileService
 */
@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserPreferencesRepository userPreferencesRepository;

    @Mock
    private UserPostRepository userPostRepository;

    @InjectMocks
    private UserProfileService userProfileService;

    private CreateUserRequest createUserRequest;
    private UserProfile userProfile;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userProfileService, "gracePeroidHours", 24);

        createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername("testuser");
        createUserRequest.setEmail("test@example.com");
        createUserRequest.setFirstName("Test");
        createUserRequest.setLastName("User");
        createUserRequest.setRoles(Set.of(UserRole.USER));

        userProfile = new UserProfile();
        userProfile.setId("user123");
        userProfile.setUsername("testuser");
        userProfile.setEmail("test@example.com");
        userProfile.setFirstName("Test");
        userProfile.setLastName("User");
        userProfile.setRoles(Set.of(UserRole.USER));
    }

    @Test
    void createUser_Success() {
        // Given
        when(userProfileRepository.existsByUsername(anyString())).thenReturn(false);
        when(userProfileRepository.existsByEmail(anyString())).thenReturn(false);
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

        // When
        UserProfileResponse response = userProfileService.createUser(createUserRequest);

        // Then
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        verify(userProfileRepository).save(any(UserProfile.class));
    }

    @Test
    void createUser_UsernameConflict() {
        // Given
        when(userProfileRepository.existsByUsername("testuser")).thenReturn(true);

        // When & Then
        assertThrows(ResourceConflictException.class,
                () -> userProfileService.createUser(createUserRequest));
    }

    @Test
    void createUser_EmailConflict() {
        // Given
        when(userProfileRepository.existsByUsername(anyString())).thenReturn(false);
        when(userProfileRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When & Then
        assertThrows(ResourceConflictException.class,
                () -> userProfileService.createUser(createUserRequest));
    }

    @Test
    void getUserById_Success() {
        // Given
        when(userProfileRepository.findByIdAndNotDeleted("user123")).thenReturn(Optional.of(userProfile));

        // When
        UserProfileResponse response = userProfileService.getUserById("user123");

        // Then
        assertNotNull(response);
        assertEquals("user123", response.getId());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void getUserById_NotFound() {
        // Given
        when(userProfileRepository.findByIdAndNotDeleted("nonexistent")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> userProfileService.getUserById("nonexistent"));
    }

    @Test
    void updateUser_Success() {
        // Given
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");

        when(userProfileRepository.findByIdAndNotDeleted("user123")).thenReturn(Optional.of(userProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

        // When
        UserProfileResponse response = userProfileService.updateUser("user123", updateRequest);

        // Then
        assertNotNull(response);
        verify(userProfileRepository).save(any(UserProfile.class));
    }

    @Test
    void softDeleteUser_Success() {
        // Given
        when(userProfileRepository.findByIdAndNotDeleted("user123")).thenReturn(Optional.of(userProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

        // When
        userProfileService.softDeleteUser("user123");

        // Then
        verify(userProfileRepository).save(any(UserProfile.class));
        verify(userPostRepository).softDeleteAllByUserId(eq("user123"), any(LocalDateTime.class));
    }

    @Test
    void hardDeleteUser_Success() {
        // Given
        userProfile.markAsDeleted();
        userProfile.setDeletedAt(LocalDateTime.now().minusHours(25)); // Past grace period

        when(userProfileRepository.findById("user123")).thenReturn(Optional.of(userProfile));

        // When
        userProfileService.hardDeleteUser("user123");

        // Then
        verify(userPreferencesRepository).deleteByUserId("user123");
        verify(userPostRepository).deleteByUserId("user123");
        verify(userProfileRepository).delete(userProfile);
    }

    @Test
    void hardDeleteUser_GracePeriodNotElapsed() {
        // Given
        userProfile.markAsDeleted();
        userProfile.setDeletedAt(LocalDateTime.now().minusHours(12)); // Within grace period

        when(userProfileRepository.findById("user123")).thenReturn(Optional.of(userProfile));

        // When & Then
        assertThrows(BusinessRuleViolationException.class,
                () -> userProfileService.hardDeleteUser("user123"));
    }

    @Test
    void hardDeleteUser_NotSoftDeleted() {
        // Given
        when(userProfileRepository.findById("user123")).thenReturn(Optional.of(userProfile));

        // When & Then
        assertThrows(BusinessRuleViolationException.class,
                () -> userProfileService.hardDeleteUser("user123"));
    }

    @Test
    void isUserActiveById_True() {
        // Given
        when(userProfileRepository.findByIdAndNotDeleted("user123")).thenReturn(Optional.of(userProfile));

        // When
        boolean result = userProfileService.isUserActiveById("user123");

        // Then
        assertTrue(result);
    }

    @Test
    void isUserActiveById_False() {
        // Given
        when(userProfileRepository.findByIdAndNotDeleted("user123")).thenReturn(Optional.empty());

        // When
        boolean result = userProfileService.isUserActiveById("user123");

        // Then
        assertFalse(result);
    }
}