package com.datagovernance.service.dto;

import com.datagovernance.service.document.AuditEntry;
import com.datagovernance.service.document.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * DTO for user profile response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private Set<UserRole> roles;
    private String bio;
    private String profileImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AuditEntry> auditTrail;
}