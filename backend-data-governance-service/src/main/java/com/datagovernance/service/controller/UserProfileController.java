package com.datagovernance.service.controller;

import com.datagovernance.service.dto.CreateUserRequest;
import com.datagovernance.service.dto.OperationAcknowledgmentResponse;
import com.datagovernance.service.dto.UpdateUserRequest;
import com.datagovernance.service.dto.UserProfileResponse;
import com.datagovernance.service.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST Controller for User Profile operations
 * Implements endpoints FR1-FR5 from the PRD
 */
@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UserProfileController {

    private final UserProfileService userProfileService;

    /**
     * FR1: POST /api/v1/users - CREATE USER
     * Creates a new User Profile
     */
    @PostMapping
    public ResponseEntity<UserProfileResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        log.info("Received request to create user with username: {}", request.getUsername());
        UserProfileResponse response = userProfileService.createUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * FR2: GET /api/v1/users/{userId} - READ USER
     * Retrieves a single User Profile by its unique ID
     * Must ignore user profiles that are soft-deleted
     */
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable String userId) {
        log.info("Received request to get user with ID: {}", userId);
        UserProfileResponse response = userProfileService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * FR3: PUT /api/v1/users/{userId} - UPDATE USER
     * Modifies an existing User Profile's details
     */
    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> updateUser(@PathVariable String userId,
            @Valid @RequestBody UpdateUserRequest request) {
        log.info("Received request to update user with ID: {}", userId);
        UserProfileResponse response = userProfileService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * FR4: DELETE /api/v1/users/{userId} - SOFT DELETE USER
     * Marks the User Profile as deleted
     * Triggers cascading soft deletion of all associated posts
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<OperationAcknowledgmentResponse> softDeleteUser(@PathVariable String userId) {
        log.info("Received request to soft delete user with ID: {}", userId);
        userProfileService.softDeleteUser(userId);

        OperationAcknowledgmentResponse response = OperationAcknowledgmentResponse.success(
                "SOFT_DELETE",
                userId,
                "User has been successfully soft deleted. The user and all associated posts are now marked as deleted.");

        return ResponseEntity.ok(response);
    }

    /**
     * FR5: POST /api/v1/users/{userId}/purge - HARD DELETE USER
     * Permanently removes the user entity from the database
     * Subject to grace period check and triggers cascading hard deletion
     */
    @PostMapping("/{userId}/purge")
    public ResponseEntity<OperationAcknowledgmentResponse> hardDeleteUser(@PathVariable String userId) {
        log.info("Received request to hard delete user with ID: {}", userId);
        userProfileService.hardDeleteUser(userId);

        OperationAcknowledgmentResponse response = OperationAcknowledgmentResponse.success(
                "HARD_DELETE",
                userId,
                "User has been permanently deleted from the system. All associated data has been removed.");

        return ResponseEntity.ok(response);
    }
}