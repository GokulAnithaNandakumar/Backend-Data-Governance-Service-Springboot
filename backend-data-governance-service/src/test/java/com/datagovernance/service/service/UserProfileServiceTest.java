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
import org.junit.jupiter.api.DisplayName;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit Tests for UserProfileService - Based on Postman API
 * Tests FR1-FR5: User Profile Management
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserProfileService Tests - FR1-FR5")
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
    private UpdateUserRequest updateUserRequest;
    private UserProfile userProfile;

    @BeforeEach
    void setUp() {
        // Create test data
        createUserRequest = new CreateUserRequest();
        createUserRequest.setUsername("johndoe");
        createUserRequest.setEmail("john@example.com");
        createUserRequest.setFirstName("John");
        createUserRequest.setLastName("Doe");
        createUserRequest.setRoles(Set.of(UserRole.USER));
        createUserRequest.setBio("Software Developer and Tech Enthusiast");

        updateUserRequest = new UpdateUserRequest();
        updateUserRequest.setBio("Updated: Senior Software Developer");
        updateUserRequest.setRoles(Set.of(UserRole.USER, UserRole.MODERATOR));

        userProfile = new UserProfile();
        userProfile.setId("test-user-id");
        userProfile.setUsername("johndoe");
        userProfile.setEmail("john@example.com");
        userProfile.setFirstName("John");
        userProfile.setLastName("Doe");
        userProfile.setBio("Software Developer and Tech Enthusiast");
        userProfile.setRoles(Set.of(UserRole.USER));
        userProfile.setDeleted(false);
        userProfile.setCreatedAt(LocalDateTime.now());
        userProfile.setUpdatedAt(LocalDateTime.now());
    }

    // ==========================================
    // FR1: CREATE USER - POST /api/v1/users
    // ==========================================

    @Test
    @DisplayName("FR1: Create User - Success (201 Created)")
    void testCreateUser_Success() {
        // Arrange
        when(userProfileRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userProfileRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

        // Act
        UserProfileResponse response = userProfileService.createUser(createUserRequest);

        // Assert
        assertNotNull(response);
        assertEquals("johndoe", response.getUsername());
        assertEquals("john@example.com", response.getEmail());
        assertEquals("John Doe", response.getFullName());
        assertTrue(response.getRoles().contains(UserRole.USER));

        verify(userProfileRepository).existsByUsername("johndoe");
        verify(userProfileRepository).existsByEmail("john@example.com");
        verify(userProfileRepository).save(any(UserProfile.class));
    }

    @Test
    @DisplayName("FR1: Create User - Duplicate Username (409 Conflict)")
    void testCreateUser_DuplicateUsername() {
        // Arrange
        when(userProfileRepository.existsByUsername("johndoe")).thenReturn(true);

        // Act & Assert
        ResourceConflictException exception = assertThrows(ResourceConflictException.class, () -> {
            userProfileService.createUser(createUserRequest);
        });

        assertTrue(exception.getMessage().contains("already exists"));
        verify(userProfileRepository).existsByUsername("johndoe");
        verify(userProfileRepository, never()).save(any(UserProfile.class));
    }

    @Test
    @DisplayName("FR1: Create User - Duplicate Email (409 Conflict)")
    void testCreateUser_DuplicateEmail() {
        // Arrange
        when(userProfileRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userProfileRepository.existsByEmail("john@example.com")).thenReturn(true);

        // Act & Assert
        ResourceConflictException exception = assertThrows(ResourceConflictException.class, () -> {
            userProfileService.createUser(createUserRequest);
        });

        assertTrue(exception.getMessage().contains("already exists"));
        verify(userProfileRepository).existsByEmail("john@example.com");
        verify(userProfileRepository, never()).save(any(UserProfile.class));
    }

    // ==========================================
    // FR2: GET USER - GET /api/v1/users/{userId}
    // ==========================================

    @Test
    @DisplayName("FR2: Get User by ID - Success (200 OK)")
    void testGetUserById_Success() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.of(userProfile));

        // Act
        UserProfileResponse response = userProfileService.getUserById("test-user-id");

        // Assert
        assertNotNull(response);
        assertEquals("test-user-id", response.getId());
        assertEquals("johndoe", response.getUsername());
        assertEquals("John Doe", response.getFullName());

        verify(userProfileRepository).findByIdAndNotDeleted("test-user-id");
    }

    @Test
    @DisplayName("FR2: Get User - Non-existent User (404 Not Found)")
    void testGetUserById_NotFound() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("nonexistent-user-id")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userProfileService.getUserById("nonexistent-user-id");
        });

        assertTrue(exception.getMessage().contains("not found"));
    }

    // ==========================================
    // FR3: UPDATE USER - PUT /api/v1/users/{userId}
    // ==========================================

    @Test
    @DisplayName("FR3: Update User - Success (200 OK)")
    void testUpdateUser_Success() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.of(userProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

        // Act
        UserProfileResponse response = userProfileService.updateUser("test-user-id", updateUserRequest);

        // Assert
        assertNotNull(response);
        verify(userProfileRepository).findByIdAndNotDeleted("test-user-id");
        verify(userProfileRepository)
                .save(argThat(profile -> profile.getBio().equals("Updated: Senior Software Developer") &&
                        profile.getRoles().contains(UserRole.MODERATOR)));
    }

    @Test
    @DisplayName("FR3: Update User - Not Found (404 Not Found)")
    void testUpdateUser_NotFound() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userProfileService.updateUser("test-user-id", updateUserRequest);
        });

        assertTrue(exception.getMessage().contains("not found"));
        verify(userProfileRepository, never()).save(any(UserProfile.class));
    }

    // ==========================================
    // FR4: SOFT DELETE - DELETE /api/v1/users/{userId}
    // ==========================================

    @Test
    @DisplayName("FR4: Soft Delete User - Success (204 No Content)")
    void testSoftDeleteUser_Success() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.of(userProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);
        doNothing().when(userPostRepository).softDeleteAllByUserId(eq("test-user-id"), any(LocalDateTime.class));

        // Act
        userProfileService.softDeleteUser("test-user-id");

        // Assert
        verify(userProfileRepository).save(argThat(profile -> profile.isDeleted() && profile.getDeletedAt() != null));
        verify(userPostRepository).softDeleteAllByUserId(eq("test-user-id"), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("FR4: Soft Delete - User Not Found (404 Not Found)")
    void testSoftDeleteUser_NotFound() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            userProfileService.softDeleteUser("test-user-id");
        });
    }

    // ==========================================
    // FR5: HARD DELETE - POST /api/v1/users/{userId}/purge
    // ==========================================

    @Test
    @DisplayName("FR5: Hard Delete User - Success After Grace Period (200 OK)")
    void testHardDeleteUser_Success() {
        // Arrange
        userProfile.setDeleted(true);
        userProfile.setDeletedAt(LocalDateTime.now().minusHours(25)); // Past grace period

        when(userProfileRepository.findById("test-user-id")).thenReturn(Optional.of(userProfile));

        // Act
        userProfileService.hardDeleteUser("test-user-id");

        // Assert
        verify(userPreferencesRepository).deleteByUserId("test-user-id");
        verify(userPostRepository).deleteByUserId("test-user-id");
        verify(userProfileRepository).delete(any(UserProfile.class));
    }

    @Test
    @DisplayName("FR5: Hard Delete - Grace Period Not Elapsed (403 Forbidden)")
    void testHardDeleteUser_GracePeriodNotElapsed() {
        // Arrange
        ReflectionTestUtils.setField(userProfileService, "gracePeroidHours", 24); // Set grace period to 24 hours
        userProfile.setDeleted(true);
        userProfile.setDeletedAt(LocalDateTime.now().minusHours(1)); // Within grace period (24 hours default)

        when(userProfileRepository.findById("test-user-id")).thenReturn(Optional.of(userProfile));

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(BusinessRuleViolationException.class, () -> {
            userProfileService.hardDeleteUser("test-user-id");
        });

        assertTrue(exception.getMessage().contains("Grace period"));
    }

    @Test
    @DisplayName("FR5: Hard Delete - User Not Soft Deleted (403 Forbidden)")
    void testHardDeleteUser_UserNotSoftDeleted() {
        // Arrange
        userProfile.setDeleted(false); // Not soft deleted

        when(userProfileRepository.findById("test-user-id")).thenReturn(Optional.of(userProfile));

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(BusinessRuleViolationException.class, () -> {
            userProfileService.hardDeleteUser("test-user-id");
        });

        assertTrue(exception.getMessage().contains("soft-deleted"));
    }

    // ==========================================
    // HELPER METHODS TESTS
    // ==========================================

    @Test
    @DisplayName("Helper: isUserActiveById - Active User Returns True")
    void testIsUserActiveById_ActiveUser() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.of(userProfile));

        // Act
        boolean isActive = userProfileService.isUserActiveById("test-user-id");

        // Assert
        assertTrue(isActive);
    }

    @Test
    @DisplayName("Helper: isUserActiveById - Inactive User Returns False")
    void testIsUserActiveById_InactiveUser() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.empty());

        // Act
        boolean isActive = userProfileService.isUserActiveById("test-user-id");

        // Assert
        assertFalse(isActive);
    }

    // ==========================================
    // EDGE CASES AND BOUNDARY TESTS
    // ==========================================

    @Test
    @DisplayName("Edge Case: Create User with Empty Bio")
    void testCreateUser_EmptyBio() {
        // Arrange
        createUserRequest.setBio("");
        when(userProfileRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userProfileRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

        // Act
        UserProfileResponse response = userProfileService.createUser(createUserRequest);

        // Assert
        assertNotNull(response);
    }

    @Test
    @DisplayName("Edge Case: Update User with Multiple Roles")
    void testUpdateUser_MultipleRoles() {
        // Arrange
        updateUserRequest.setRoles(Set.of(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN));
        when(userProfileRepository.findByIdAndNotDeleted("test-user-id")).thenReturn(Optional.of(userProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(userProfile);

        // Act
        UserProfileResponse response = userProfileService.updateUser("test-user-id", updateUserRequest);

        // Assert
        assertNotNull(response);
        verify(userProfileRepository).save(argThat(profile -> profile.getRoles().size() == 3 &&
                profile.getRoles().contains(UserRole.ADMIN)));
    }
}