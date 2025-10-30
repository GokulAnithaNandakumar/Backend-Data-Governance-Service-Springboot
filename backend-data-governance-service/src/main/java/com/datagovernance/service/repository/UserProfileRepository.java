package com.datagovernance.service.repository;

import com.datagovernance.service.document.UserProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for UserProfile documents
 */
@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    /**
     * Find user by username, excluding soft-deleted users
     */
    @Query("{ 'username': ?0, 'deleted': false }")
    Optional<UserProfile> findByUsernameAndNotDeleted(String username);

    /**
     * Find user by email, excluding soft-deleted users
     */
    @Query("{ 'email': ?0, 'deleted': false }")
    Optional<UserProfile> findByEmailAndNotDeleted(String email);

    /**
     * Find user by ID, excluding soft-deleted users
     */
    @Query("{ '_id': ?0, 'deleted': false }")
    Optional<UserProfile> findByIdAndNotDeleted(String id);

    /**
     * Check if username exists (including soft-deleted users for conflict checking)
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists (including soft-deleted users for conflict checking)
     */
    boolean existsByEmail(String email);

    /**
     * Find user by username (including soft-deleted for internal operations)
     */
    Optional<UserProfile> findByUsername(String username);

    /**
     * Find user by email (including soft-deleted for internal operations)
     */
    Optional<UserProfile> findByEmail(String email);
}