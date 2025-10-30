package com.datagovernance.service.controller;

import com.datagovernance.service.dto.UpdatePreferencesRequest;
import com.datagovernance.service.dto.UserPreferencesResponse;
import com.datagovernance.service.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST Controller for User Preferences operations
 * Implements endpoints FR6-FR7 from the PRD
 */
@Slf4j
@RestController
@RequestMapping("/users/{userId}/preferences")
@RequiredArgsConstructor
@Validated
public class UserPreferencesController {

    private final UserPreferencesService userPreferencesService;

    /**
     * FR6: PUT /api/v1/users/{userId}/preferences - UPDATE PREFERENCES
     * Creates or overwrites the configuration settings (Preferences) for a specific
     * user
     */
    @PutMapping
    public ResponseEntity<UserPreferencesResponse> updatePreferences(@PathVariable String userId,
            @Valid @RequestBody UpdatePreferencesRequest request) {

        log.info("Received request to update preferences for user ID: {}", userId);
        UserPreferencesResponse response = userPreferencesService.updatePreferences(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * FR7: GET /api/v1/users/{userId}/preferences - READ PREFERENCES
     * Retrieves the current Preference settings
     */
    @GetMapping
    public ResponseEntity<UserPreferencesResponse> getPreferences(@PathVariable String userId) {
        log.info("Received request to get preferences for user ID: {}", userId);
        UserPreferencesResponse response = userPreferencesService.getPreferences(userId);
        return ResponseEntity.ok(response);
    }
}