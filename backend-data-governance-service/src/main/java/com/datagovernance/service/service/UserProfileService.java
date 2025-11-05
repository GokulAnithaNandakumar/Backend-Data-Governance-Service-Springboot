package com.datagovernance.service.service;

import com.datagovernance.service.document.UserPost;
import com.datagovernance.service.document.UserPreferences;
import com.datagovernance.service.document.UserProfile;
import com.datagovernance.service.dto.CreateUserRequest;
import com.datagovernance.service.dto.UpdateUserRequest;
import com.datagovernance.service.dto.UserProfileResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.exception.ResourceConflictException;
import com.datagovernance.service.exception.ResourceNotFoundException;
import com.datagovernance.service.repository.UserPostRepository;
import com.datagovernance.service.repository.UserPreferencesRepository;
import com.datagovernance.service.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service class for managing User Profiles with comprehensive business logic
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final UserPostRepository userPostRepository;

    @Value("${app.data-governance.hard-delete-grace-period-hours:24}")
    private int gracePeroidHours;

    /**
     * Creates a new user profile after validation
     */
    @Transactional
    public UserProfileResponse createUser(CreateUserRequest request) {
        log.info("Creating new user with username: {}", request.getUsername());

        // Business Rule 4: Core Entity Uniqueness Check
        if (userProfileRepository.existsByUsername(request.getUsername())) {
            throw new ResourceConflictException("User", "username", request.getUsername());
        }

        if (userProfileRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("User", "email", request.getEmail());
        }

        UserProfile userProfile = new UserProfile();
        userProfile.setUsername(request.getUsername());
        userProfile.setEmail(request.getEmail());
        userProfile.setFirstName(request.getFirstName());
        userProfile.setLastName(request.getLastName());
        userProfile.setRoles(request.getRoles());
        userProfile.setBio(request.getBio());
        userProfile.setProfileImageUrl(request.getProfileImageUrl());

        // Business Rule 8: Auditing
        userProfile.addAuditEntry("CREATE", "User profile created");

        UserProfile savedUser = userProfileRepository.save(userProfile);
        log.info("User created successfully with ID: {}", savedUser.getId());

        return mapToResponse(savedUser);
    }

    /**
     * Retrieves a user profile by ID (excluding soft-deleted)
     */
    public UserProfileResponse getUserById(String userId) {
        log.info("Retrieving user with ID: {}", userId);

        UserProfile user = userProfileRepository.findByIdAndNotDeleted(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        return mapToResponse(user);
    }

    /**
     * Updates an existing user profile
     */
    @Transactional
    public UserProfileResponse updateUser(String userId, UpdateUserRequest request) {
        log.info("Updating user with ID: {}", userId);

        UserProfile user = userProfileRepository.findByIdAndNotDeleted(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Check for email conflicts if email is being changed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userProfileRepository.existsByEmail(request.getEmail())) {
                throw new ResourceConflictException("User", "email", request.getEmail());
            }
            user.setEmail(request.getEmail());
        }

        // Update other fields if provided
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getRoles() != null) {
            user.setRoles(request.getRoles());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl());
        }

        // Business Rule 8: Auditing
        user.addAuditEntry("UPDATE", "User profile updated");

        UserProfile savedUser = userProfileRepository.save(user);
        log.info("User updated successfully with ID: {}", savedUser.getId());

        return mapToResponse(savedUser);
    }

    /**
     * Soft deletes a user profile and cascading soft deletes all posts
     */
    @Transactional
    public void softDeleteUser(String userId) {
        log.info("Soft deleting user with ID: {}", userId);

        UserProfile user = userProfileRepository.findByIdAndNotDeleted(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Business Rule 11: Cascading Soft Deletion
        LocalDateTime deletionTime = LocalDateTime.now();

        // Soft delete the user
        user.markAsDeleted();
        user.addAuditEntry("SOFT_DELETE", "User profile soft deleted");

        // Soft delete all associated posts
        userPostRepository.softDeleteAllByUserId(userId, deletionTime);

        userProfileRepository.save(user);
        log.info("User and associated posts soft deleted successfully for ID: {}", userId);
    }

    /**
     * Hard deletes a user profile after grace period validation
     */
    @Transactional
    public void hardDeleteUser(String userId) {
        log.info("Attempting hard delete for user with ID: {}", userId);

        UserProfile user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Business Rule 7: Hard Delete Grace Period
        if (!user.isDeleted()) {
            throw new BusinessRuleViolationException("User must be soft-deleted before hard deletion");
        }

        if (user.getDeletedAt() == null) {
            throw new BusinessRuleViolationException("User deletion timestamp is missing");
        }

        LocalDateTime gracePeroidEnd = user.getDeletedAt().plusHours(gracePeroidHours);
        if (LocalDateTime.now().isBefore(gracePeroidEnd)) {
            throw new BusinessRuleViolationException(
                    String.format("Grace period of %d hours has not elapsed since soft deletion", gracePeroidHours));
        }

        // Business Rule 12: Cascading Hard Deletion
        // Delete all associated preferences
        userPreferencesRepository.deleteByUserId(userId);

        // Delete all associated posts
        userPostRepository.deleteByUserId(userId);

        // Add final audit entry
        user.addAuditEntry("HARD_DELETE", "User profile permanently deleted");

        // Delete the user profile
        userProfileRepository.delete(user);

        log.info("User and all associated data hard deleted successfully for ID: {}", userId);
    }

    /**
     * Checks if a user exists and is active (not soft-deleted)
     */
    public boolean isUserActiveById(String userId) {
        return userProfileRepository.findByIdAndNotDeleted(userId).isPresent();
    }

    /**
     * Retrieves all user profiles (including soft-deleted for admin purposes)
     */
    public List<UserProfileResponse> getAllUsers() {
        log.info("Retrieving all users");

        List<UserProfile> users = userProfileRepository.findAll();
        return users.stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Maps UserProfile entity to UserProfileResponse DTO
     */
    private UserProfileResponse mapToResponse(UserProfile user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setFullName(user.getFullName());
        response.setRoles(user.getRoles());
        response.setBio(user.getBio());
        response.setProfileImageUrl(user.getProfileImageUrl());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setAuditTrail(user.getAuditTrail());
        return response;
    }
}