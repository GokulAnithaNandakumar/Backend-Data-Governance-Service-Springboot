package com.datagovernance.service.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * User Profile document representing a user in the system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "user_profiles")
public class UserProfile extends BaseAuditDocument {

    @Id
    private String id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Indexed(unique = true)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be in valid format")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    private String lastName;

    @NotEmpty(message = "At least one role is required")
    private Set<UserRole> roles = new HashSet<>();

    private String bio;

    private String profileImageUrl;

    // Audit trail for tracking all operations on this user
    private List<AuditEntry> auditTrail = new ArrayList<>();

    public void addAuditEntry(String action, String details) {
        if (this.auditTrail == null) {
            this.auditTrail = new ArrayList<>();
        }
        this.auditTrail.add(AuditEntry.create(action, details));
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean hasRole(UserRole role) {
        return roles != null && roles.contains(role);
    }

    @Override
    public void markAsDeleted() {
        super.markAsDeleted();
        addAuditEntry("SOFT_DELETE", "User profile marked as deleted");
    }
}