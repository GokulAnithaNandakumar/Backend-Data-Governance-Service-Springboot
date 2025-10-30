package com.datagovernance.service.repository;

import com.datagovernance.service.document.UserPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.Update;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for UserPost documents
 */
@Repository
public interface UserPostRepository extends MongoRepository<UserPost, String> {

    /**
     * Find all posts by user ID, excluding soft-deleted posts
     */
    @Query("{ 'userId': ?0, 'deleted': false }")
    List<UserPost> findByUserIdAndNotDeleted(String userId);

    /**
     * Find post by ID, excluding soft-deleted posts
     */
    @Query("{ '_id': ?0, 'deleted': false }")
    Optional<UserPost> findByIdAndNotDeleted(String id);

    /**
     * Find all posts by user ID (including soft-deleted for internal operations)
     */
    List<UserPost> findByUserId(String userId);

    /**
     * Soft delete all posts by user ID (for cascading soft deletion)
     */
    @Query("{ 'userId': ?0, 'deleted': false }")
    @Update("{ '$set': { 'deleted': true, 'deletedAt': ?1 } }")
    void softDeleteAllByUserId(String userId, java.time.LocalDateTime deletedAt);

    /**
     * Delete all posts by user ID (for hard deletion cascade)
     */
    void deleteByUserId(String userId);
}