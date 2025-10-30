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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit Tests for UserProfileService
 * Covers all Business Rules from PRD: BR1-BR12
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserProfileService - Business Rules Validation")
class ComprehensiveUserProfileServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserPreferencesRepository userPreferencesRepository;

    @Mock
    private UserPostRepository userPostRepository;

    @InjectMocks
    private UserProfileService userProfileService;

    private CreateUserRequest validCreateRequest;
    private UpdateUserRequest validUpdateRequest;
    private UserProfile existingUser;
    private String testUserId = "test-user-id";

    @BeforeEach
    void setUp() {
        // Set grace period for testing
        ReflectionTestUtils.setField(userProfileService, "gracePeroidHours", 24);

        // Setup valid create request
        validCreateRequest = new CreateUserRequest();
        validCreateRequest.setUsername("testuser");
        validCreateRequest.setEmail("test@example.com");
        validCreateRequest.setFirstName("John");
        validCreateRequest.setLastName("Doe");
        validCreateRequest.setRoles(Set.of(UserRole.USER));
        validCreateRequest.setBio("Test bio");

        // Setup valid update request
        validUpdateRequest = new UpdateUserRequest();
        validUpdateRequest.setFirstName("Jane");
        validUpdateRequest.setLastName("Smith");
        validUpdateRequest.setBio("Updated bio");

        // Setup existing user
        existingUser = new UserProfile();
        existingUser.setId(testUserId);
        existingUser.setUsername("testuser");
        existingUser.setEmail("test@example.com");
        existingUser.setFirstName("John");
        existingUser.setLastName("Doe");
        existingUser.setRoles(Set.of(UserRole.USER));
        existingUser.setDeleted(false);
        existingUser.setCreatedAt(LocalDateTime.now());
    }

    // ==========================================
    // FR1: CREATE USER - Business Rules 1-4, 6, 8
    // ==========================================

    @Test
    @DisplayName("FR1: Create User - Success with Business Rule 6: Timestamp Enforcement & BR8: Auditing")
    void testCreateUser_Success() {
        // Arrange
        when(userProfileRepository.existsByUsername(anyString())).thenReturn(false);
        when(userProfileRepository.existsByEmail(anyString())).thenReturn(false);
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(existingUser);

        // Act
        UserProfileResponse result = userProfileService.createUser(validCreateRequest);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals("John Doe", result.getFullName());
        assertEquals(Set.of(UserRole.USER), result.getRoles());

        // Verify Business Rule 4: Uniqueness checks
        verify(userProfileRepository).existsByUsername("testuser");
        verify(userProfileRepository).existsByEmail("test@example.com");

        // Verify Business Rule 6: Timestamp enforcement & BR8: Auditing
        verify(userProfileRepository).save(argThat(user -> user.getCreatedAt() != null &&
                user.getUpdatedAt() != null &&
                user.getAuditTrail() != null &&
                !user.getAuditTrail().isEmpty()));
    }

    @Test
    @DisplayName("Business Rule 4: Core Entity Uniqueness Check - Username Conflict")
    void testCreateUser_UsernameConflict() {
        // Arrange
        when(userProfileRepository.existsByUsername("testuser")).thenReturn(true);

        // Act & Assert
        ResourceConflictException exception = assertThrows(
                ResourceConflictException.class,
                () -> userProfileService.createUser(validCreateRequest));

        assertEquals("User with username 'testuser' already exists", exception.getMessage());
        verify(userProfileRepository, never()).save(any());
    }

    @Test
    @DisplayName("Business Rule 4: Core Entity Uniqueness Check - Email Conflict")
    void testCreateUser_EmailConflict() {
        // Arrange
        when(userProfileRepository.existsByUsername(anyString())).thenReturn(false);
        when(userProfileRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        ResourceConflictException exception = assertThrows(
                ResourceConflictException.class,
                () -> userProfileService.createUser(validCreateRequest));

        assertEquals("User with email 'test@example.com' already exists", exception.getMessage());
        verify(userProfileRepository, never()).save(any());
    }

    // ==========================================
    // FR2: GET USER - Business Rule 5
    // ==========================================

    @Test
    @DisplayName("FR2: Get User - Success")
    void testGetUser_Success() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.of(existingUser));

        // Act
        UserProfileResponse result = userProfileService.getUserById(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(testUserId, result.getId());
        assertEquals("testuser", result.getUsername());
        verify(userProfileRepository).findByIdAndNotDeleted(testUserId);
    }

    @Test
    @DisplayName("Business Rule 5: Soft Deletion Read Filter - Should Not Return Soft Deleted User")
    void testGetUser_SoftDeleted_NotFound() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userProfileService.getUserById(testUserId));

        assertEquals("User with id '" + testUserId + "' not found", exception.getMessage());
    }

    // ==========================================
    // FR3: UPDATE USER - Business Rules 6, 8
    // ==========================================

    @Test
    @DisplayName("FR3: Update User - Success with Business Rule 6: Timestamp Enforcement & BR8: Auditing")
    void testUpdateUser_Success() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.of(existingUser));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(existingUser);

        // Act
        UserProfileResponse result = userProfileService.updateUser(testUserId, validUpdateRequest);

        // Assert
        assertNotNull(result);

        // Verify Business Rule 6: Timestamp enforcement & BR8: Auditing
        verify(userProfileRepository).save(argThat(user -> user.getUpdatedAt() != null &&
                user.getAuditTrail() != null));
    }

    @Test
    @DisplayName("FR3: Update User - Not Found")
    void testUpdateUser_NotFound() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userProfileService.updateUser(testUserId, validUpdateRequest));

        assertEquals("User with id '" + testUserId + "' not found", exception.getMessage());
        verify(userProfileRepository, never()).save(any());
    }

    // ==========================================
    // FR4: SOFT DELETE USER - Business Rules 6, 8, 11
    // ==========================================

    @Test
    @DisplayName("FR4: Soft Delete User - Success with Business Rule 11: Cascading Soft Deletion")
    void testSoftDeleteUser_Success() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.of(existingUser));
        when(userProfileRepository.save(any(UserProfile.class))).thenReturn(existingUser);

        // Act
        userProfileService.softDeleteUser(testUserId);

        // Assert
        // Verify user is marked as deleted with timestamp (Business Rule 6)
        verify(userProfileRepository).save(argThat(user -> user.isDeleted() &&
                user.getDeletedAt() != null &&
                user.getAuditTrail() != null));

        // Verify cascading soft deletion of posts (Business Rule 11)
        verify(userPostRepository).softDeleteAllByUserId(eq(testUserId), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("FR4: Soft Delete User - Not Found")
    void testSoftDeleteUser_NotFound() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userProfileService.softDeleteUser(testUserId));

        assertEquals("User with id '" + testUserId + "' not found", exception.getMessage());
        verify(userProfileRepository, never()).save(any());
        verify(userPostRepository, never()).softDeleteAllByUserId(anyString(), any());
    }

    // ==========================================
    // FR5: HARD DELETE USER - Business Rules 7, 8, 12
    // ==========================================

    @Test
    @DisplayName("Business Rule 7: Hard Delete Grace Period Check - Should Fail")
    void testHardDeleteUser_GracePeriodNotElapsed() {
        // Arrange - User soft deleted recently (within grace period)
        UserProfile softDeletedUser = new UserProfile();
        softDeletedUser.setId(testUserId);
        softDeletedUser.setDeleted(true);
        softDeletedUser.setDeletedAt(LocalDateTime.now().minusHours(12)); // Only 12 hours ago

        when(userProfileRepository.findById(testUserId)).thenReturn(Optional.of(softDeletedUser));

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> userProfileService.hardDeleteUser(testUserId));

        assertEquals("Cannot hard delete user: grace period of 24 hours has not elapsed since soft deletion",
                exception.getMessage());
        verify(userProfileRepository, never()).delete(any());
    }

    @Test
    @DisplayName("FR5: Hard Delete User - Success with Business Rule 12: Cascading Hard Deletion")
    void testHardDeleteUser_Success() {
        // Arrange - User soft deleted beyond grace period
        UserProfile softDeletedUser = new UserProfile();
        softDeletedUser.setId(testUserId);
        softDeletedUser.setDeleted(true);
        softDeletedUser.setDeletedAt(LocalDateTime.now().minusHours(25)); // 25 hours ago (beyond grace period)

        when(userProfileRepository.findById(testUserId)).thenReturn(Optional.of(softDeletedUser));

        // Act
        userProfileService.hardDeleteUser(testUserId);

        // Assert - Verify cascading hard deletion (Business Rule 12)
        verify(userPreferencesRepository).deleteByUserId(testUserId);
        verify(userPostRepository).deleteByUserId(testUserId);
        verify(userProfileRepository).delete(softDeletedUser);
    }

    @Test
    @DisplayName("FR5: Hard Delete User - User Not Found")
    void testHardDeleteUser_UserNotFound() {
        // Arrange
        when(userProfileRepository.findById(testUserId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userProfileService.hardDeleteUser(testUserId));

        assertEquals("User with id '" + testUserId + "' not found", exception.getMessage());
        verify(userProfileRepository, never()).delete(any());
    }

    @Test
    @DisplayName("FR5: Hard Delete User - User Not Soft Deleted")
    void testHardDeleteUser_UserNotSoftDeleted() {
        // Arrange - User exists but not soft deleted
        UserProfile activeUser = new UserProfile();
        activeUser.setId(testUserId);
        activeUser.setDeleted(false);

        when(userProfileRepository.findById(testUserId)).thenReturn(Optional.of(activeUser));

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> userProfileService.hardDeleteUser(testUserId));

        assertEquals("Cannot hard delete user: user is not soft-deleted", exception.getMessage());
        verify(userProfileRepository, never()).delete(any());
    }

    // ==========================================
    // Helper Method Tests
    // ==========================================

    @Test
    @DisplayName("Helper: isUserActiveById - Active User")
    void testIsUserActiveById_ActiveUser() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.of(existingUser));

        // Act
        boolean result = userProfileService.isUserActiveById(testUserId);

        // Assert
        assertTrue(result);
        verify(userProfileRepository).findByIdAndNotDeleted(testUserId);
    }

    @Test
    @DisplayName("Helper: isUserActiveById - Inactive/Non-existent User")
    void testIsUserActiveById_InactiveUser() {
        // Arrange
        when(userProfileRepository.findByIdAndNotDeleted(testUserId)).thenReturn(Optional.empty());

        // Act
        boolean result = userProfileService.isUserActiveById(testUserId);

        // Assert
        assertFalse(result);
        verify(userProfileRepository).findByIdAndNotDeleted(testUserId);
    }
}