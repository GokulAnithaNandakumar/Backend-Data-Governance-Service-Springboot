package com.datagovernance.service.repository;

import com.datagovernance.service.document.UserPreferences;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for UserPreferences documents
 */
@Repository
public interface UserPreferencesRepository extends MongoRepository<UserPreferences, String> {

    /**
     * Find preferences by user ID, excluding soft-deleted preferences
     */
    @Query("{ 'userId': ?0, 'deleted': false }")
    Optional<UserPreferences> findByUserIdAndNotDeleted(String userId);

    /**
     * Find preferences by user ID (including soft-deleted for internal operations)
     */
    Optional<UserPreferences> findByUserId(String userId);

    /**
     * Delete preferences by user ID (for hard deletion cascade)
     */
    void deleteByUserId(String userId);
}