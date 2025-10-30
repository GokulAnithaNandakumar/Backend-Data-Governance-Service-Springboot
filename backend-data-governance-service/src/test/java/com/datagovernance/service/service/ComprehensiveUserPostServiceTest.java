package com.datagovernance.service.service;

import com.datagovernance.service.document.UserPost;
import com.datagovernance.service.dto.CreatePostRequest;
import com.datagovernance.service.dto.UserPostResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.exception.ResourceNotFoundException;
import com.datagovernance.service.repository.UserPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit Tests for UserPostService
 * Covers Business Rules 5, 6, 9 from PRD
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserPostService - Business Rules Validation")
class ComprehensiveUserPostServiceTest {

    @Mock
    private UserPostRepository userPostRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserPostService userPostService;

    private CreatePostRequest validCreateRequest;
    private UserPost existingPost;
    private String testUserId = "test-user-id";
    private String testPostId = "test-post-id";

    @BeforeEach
    void setUp() {
        // Setup valid create request
        validCreateRequest = new CreatePostRequest();
        validCreateRequest.setTitle("Test Post Title");
        validCreateRequest.setContent("Test post content with sufficient length for validation");
        validCreateRequest.setTags(Arrays.asList("test", "integration"));
        validCreateRequest.setIsPublic(true);
        validCreateRequest.setStatus("published");

        // Setup existing post
        existingPost = new UserPost();
        existingPost.setId(testPostId);
        existingPost.setUserId(testUserId);
        existingPost.setTitle("Existing Post");
        existingPost.setContent("Existing post content");
        existingPost.setDeleted(false);
        existingPost.setCreatedAt(LocalDateTime.now());
        existingPost.setUpdatedAt(LocalDateTime.now());
    }

    // ==========================================
    // FR8: CREATE POST - Business Rule 9
    // ==========================================

    @Test
    @DisplayName("FR8: Create Post - Success with Business Rule 6: Timestamp Enforcement")
    void testCreatePost_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(existingPost);

        // Act
        UserPostResponse result = userPostService.createPost(testUserId, validCreateRequest);

        // Assert
        assertNotNull(result);
        assertEquals(testUserId, result.getUserId());
        assertEquals("Test Post Title", result.getTitle());
        assertEquals("Test post content with sufficient length for validation", result.getContent());
        assertEquals(Arrays.asList("test", "integration"), result.getTags());
        assertTrue(result.isPublic());
        assertEquals("published", result.getStatus());

        // Verify Business Rule 9: Post Creation Integrity
        verify(userProfileService).isUserActiveById(testUserId);

        // Verify Business Rule 6: Timestamp enforcement
        verify(userPostRepository).save(argThat(post -> post.getUserId().equals(testUserId) &&
                post.getTitle().equals("Test Post Title") &&
                post.getContent().equals("Test post content with sufficient length for validation") &&
                post.getTags().equals(Arrays.asList("test", "integration")) &&
                post.isPublic() &&
                post.getStatus().equals("published") &&
                post.getCreatedAt() != null &&
                post.getUpdatedAt() != null));
    }

    @Test
    @DisplayName("Business Rule 9: Post Creation Integrity - User Not Active")
    void testCreatePost_UserNotActive() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(false);

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> userPostService.createPost(testUserId, validCreateRequest));

        assertEquals("Cannot create post for inactive or non-existent user", exception.getMessage());
        verify(userPostRepository, never()).save(any());
    }

    // ==========================================
    // FR9: GET POSTS - Business Rule 5
    // ==========================================

    @Test
    @DisplayName("FR9: Get Posts by User ID - Success with Business Rule 5: Soft Deletion Read Filter")
    void testGetPostsByUserId_Success() {
        // Arrange
        UserPost post1 = createTestPost("post1", false); // Active post
        UserPost post2 = createTestPost("post2", false); // Active post
        List<UserPost> activePosts = Arrays.asList(post1, post2);

        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPostRepository.findByUserIdAndNotDeleted(testUserId)).thenReturn(activePosts);

        // Act
        List<UserPostResponse> result = userPostService.getPostsByUserId(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("post1", result.get(0).getId());
        assertEquals("post2", result.get(1).getId());

        // Verify Business Rule 5: Only non-soft-deleted posts returned
        verify(userPostRepository).findByUserIdAndNotDeleted(testUserId);
        verify(userProfileService).isUserActiveById(testUserId);
    }

    @Test
    @DisplayName("FR9: Get Posts - User Not Found")
    void testGetPostsByUserId_UserNotFound() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userPostService.getPostsByUserId(testUserId));

        assertEquals("User with id '" + testUserId + "' not found", exception.getMessage());
        verify(userPostRepository, never()).findByUserIdAndNotDeleted(anyString());
    }

    @Test
    @DisplayName("FR9: Get Posts - Empty List for User with No Posts")
    void testGetPostsByUserId_EmptyList() {
        // Arrange
        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPostRepository.findByUserIdAndNotDeleted(testUserId)).thenReturn(Arrays.asList());

        // Act
        List<UserPostResponse> result = userPostService.getPostsByUserId(testUserId);

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
        verify(userPostRepository).findByUserIdAndNotDeleted(testUserId);
    }

    // ==========================================
    // FR10: SOFT DELETE POST - Business Rule 6
    // ==========================================

    @Test
    @DisplayName("FR10: Soft Delete Post - Success with Business Rule 6: Timestamp Enforcement")
    void testSoftDeletePost_Success() {
        // Arrange
        when(userPostRepository.findById(testPostId)).thenReturn(Optional.of(existingPost));
        when(userPostRepository.save(any(UserPost.class))).thenReturn(existingPost);

        // Act
        assertDoesNotThrow(() -> userPostService.softDeletePost(testPostId));

        // Assert
        verify(userPostRepository).findById(testPostId);

        // Verify Business Rule 6: Timestamp enforcement for soft deletion
        verify(userPostRepository).save(argThat(post -> post.isDeleted() &&
                post.getDeletedAt() != null));
    }

    @Test
    @DisplayName("FR10: Soft Delete Post - Post Not Found")
    void testSoftDeletePost_NotFound() {
        // Arrange
        when(userPostRepository.findById(testPostId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userPostService.softDeletePost(testPostId));

        assertEquals("Post with id '" + testPostId + "' not found", exception.getMessage());
        verify(userPostRepository, never()).save(any());
    }

    // ==========================================
    // Additional Helper Method Tests
    // ==========================================

    @Test
    @DisplayName("Get Post by ID - Success with Business Rule 5: Soft Deletion Filter")
    void testGetPostById_Success() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted(testPostId)).thenReturn(Optional.of(existingPost));

        // Act
        UserPostResponse result = userPostService.getPostById(testPostId);

        // Assert
        assertNotNull(result);
        assertEquals(testPostId, result.getId());
        assertEquals(testUserId, result.getUserId());

        // Verify Business Rule 5: Only non-soft-deleted posts accessible
        verify(userPostRepository).findByIdAndNotDeleted(testPostId);
    }

    @Test
    @DisplayName("Get Post by ID - Soft Deleted Post Not Found")
    void testGetPostById_SoftDeletedNotFound() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted(testPostId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userPostService.getPostById(testPostId));

        assertEquals("Post with id '" + testPostId + "' not found", exception.getMessage());
    }

    // ==========================================
    // Test Edge Cases
    // ==========================================

    @Test
    @DisplayName("Create Post - Default Values Applied")
    void testCreatePost_DefaultValues() {
        // Arrange
        CreatePostRequest minimalRequest = new CreatePostRequest();
        minimalRequest.setTitle("Minimal Post");
        minimalRequest.setContent("Minimal content");

        when(userProfileService.isUserActiveById(testUserId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(existingPost);

        // Act
        UserPostResponse result = userPostService.createPost(testUserId, minimalRequest);

        // Assert
        assertNotNull(result);

        // Verify default values are applied
        verify(userPostRepository).save(argThat(post -> post.getViewCount() == 0 &&
                post.getLikeCount() == 0 &&
                post.getCommentCount() == 0 &&
                !post.isDeleted()));
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private UserPost createTestPost(String postId, boolean deleted) {
        UserPost post = new UserPost();
        post.setId(postId);
        post.setUserId(testUserId);
        post.setTitle("Test Post " + postId);
        post.setContent("Test content for " + postId);
        post.setDeleted(deleted);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        if (deleted) {
            post.setDeletedAt(LocalDateTime.now());
        }
        return post;
    }
}