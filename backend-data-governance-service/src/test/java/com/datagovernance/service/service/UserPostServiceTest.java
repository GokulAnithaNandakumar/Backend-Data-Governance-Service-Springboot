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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive Unit Tests for UserPostService - Based on Postman API
 * Tests FR8-FR10: User Post Management
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserPostService Tests - FR8-FR10")
class UserPostServiceTest {

    @Mock
    private UserPostRepository userPostRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserPostService userPostService;

    private CreatePostRequest createPostRequest;
    private UserPost userPost;
    private String userId = "test-user-id";
    private String postId = "test-post-id";

    @BeforeEach
    void setUp() {
        // Create test data based on actual structure
        createPostRequest = new CreatePostRequest();
        createPostRequest.setTitle("Understanding Spring Boot Microservices");
        createPostRequest
                .setContent("In this post, I'll explain how to build scalable microservices using Spring Boot...");
        createPostRequest.setTags(Arrays.asList("Spring Boot", "Microservices", "Java"));
        createPostRequest.setIsPublic(true);
        createPostRequest.setStatus("PUBLISHED");

        userPost = new UserPost();
        userPost.setId(postId);
        userPost.setUserId(userId);
        userPost.setTitle("Understanding Spring Boot Microservices");
        userPost.setContent("In this post, I'll explain how to build scalable microservices using Spring Boot...");
        userPost.setTags(Arrays.asList("Spring Boot", "Microservices", "Java"));
        userPost.setPublic(true);
        userPost.setStatus("PUBLISHED");
        userPost.setDeleted(false);
        userPost.setCreatedAt(LocalDateTime.now());
        userPost.setUpdatedAt(LocalDateTime.now());
    }

    // ==========================================
    // FR8: CREATE POST - POST /api/v1/users/{userId}/posts
    // ==========================================

    @Test
    @DisplayName("FR8: Create Post - Success (201 Created)")
    void testCreatePost_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        UserPostResponse response = userPostService.createPost(userId, createPostRequest);

        // Assert
        assertNotNull(response);
        assertEquals(postId, response.getId());
        assertEquals("Understanding Spring Boot Microservices", response.getTitle());
        assertEquals(userId, response.getUserId());
        assertEquals(3, response.getTags().size());
        assertTrue(response.getTags().contains("Spring Boot"));
        assertTrue(response.isPublic());
        assertEquals("PUBLISHED", response.getStatus());

        verify(userProfileService).isUserActiveById(userId);
        verify(userPostRepository).save(any(UserPost.class));
    }

    @Test
    @DisplayName("FR8: Create Post - Inactive User (Exception)")
    void testCreatePost_InactiveUser() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(false);

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(BusinessRuleViolationException.class, () -> {
            userPostService.createPost(userId, createPostRequest);
        });

        assertTrue(exception.getMessage().contains("inactive"));
        verify(userProfileService).isUserActiveById(userId);
        verify(userPostRepository, never()).save(any(UserPost.class));
    }

    @Test
    @DisplayName("FR8: Create Post - Draft Status")
    void testCreatePost_DraftStatus() {
        // Arrange
        createPostRequest.setStatus("DRAFT");
        createPostRequest.setIsPublic(false);
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        UserPostResponse response = userPostService.createPost(userId, createPostRequest);

        // Assert
        assertNotNull(response);
        verify(userPostRepository).save(argThat(post -> post.getStatus().equals("DRAFT") && !post.isPublic()));
    }

    // ==========================================
    // FR9: GET USER POSTS - GET /api/v1/users/{userId}/posts
    // ==========================================

    @Test
    @DisplayName("FR9: Get User Posts - Success (200 OK)")
    void testGetUserPosts_Success() {
        // Arrange
        UserPost post1 = createTestPost("post1", "First Post", "Content 1");
        UserPost post2 = createTestPost("post2", "Second Post", "Content 2");
        List<UserPost> posts = Arrays.asList(post1, post2);

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.findByUserIdAndNotDeleted(userId)).thenReturn(posts);

        // Act
        List<UserPostResponse> responses = userPostService.getPostsByUserId(userId);

        // Assert
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals("First Post", responses.get(0).getTitle());
        assertEquals("Second Post", responses.get(1).getTitle());

        verify(userProfileService).isUserActiveById(userId);
        verify(userPostRepository).findByUserIdAndNotDeleted(userId);
    }

    @Test
    @DisplayName("FR9: Get Posts - Inactive User (404 Not Found)")
    void testGetUserPosts_InactiveUser() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(false);

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userPostService.getPostsByUserId(userId);
        });

        assertTrue(exception.getMessage().contains("not found"));
        verify(userProfileService).isUserActiveById(userId);
        verify(userPostRepository, never()).findByUserIdAndNotDeleted(anyString());
    }

    @Test
    @DisplayName("FR9: Get Posts - Empty List for User with No Posts")
    void testGetUserPosts_EmptyList() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.findByUserIdAndNotDeleted(userId)).thenReturn(Arrays.asList());

        // Act
        List<UserPostResponse> responses = userPostService.getPostsByUserId(userId);

        // Assert
        assertNotNull(responses);
        assertTrue(responses.isEmpty());
    }

    // ==========================================
    // FR10: SOFT DELETE POST - DELETE /api/v1/posts/{postId}
    // ==========================================

    @Test
    @DisplayName("FR10: Soft Delete Post - Success (204 No Content)")
    void testSoftDeletePost_Success() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted(postId)).thenReturn(Optional.of(userPost));
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        userPostService.softDeletePost(postId);

        // Assert
        verify(userPostRepository).findByIdAndNotDeleted(postId);
        verify(userPostRepository).save(argThat(post -> post.isDeleted() && post.getDeletedAt() != null));
    }

    @Test
    @DisplayName("FR10: Soft Delete - Non-existent Post (404 Not Found)")
    void testSoftDeletePost_NotFound() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted("nonexistent-post")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userPostService.softDeletePost("nonexistent-post");
        });

        assertTrue(exception.getMessage().contains("not found"));
    }

    // ==========================================
    // GET SINGLE POST - Additional Method
    // ==========================================

    @Test
    @DisplayName("Get Post by ID - Success (200 OK)")
    void testGetPostById_Success() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted(postId)).thenReturn(Optional.of(userPost));

        // Act
        UserPostResponse response = userPostService.getPostById(postId);

        // Assert
        assertNotNull(response);
        assertEquals(postId, response.getId());
        assertEquals("Understanding Spring Boot Microservices", response.getTitle());
        assertEquals(userId, response.getUserId());
    }

    @Test
    @DisplayName("Get Post by ID - Not Found (404 Not Found)")
    void testGetPostById_NotFound() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted("nonexistent-post")).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            userPostService.getPostById("nonexistent-post");
        });

        assertTrue(exception.getMessage().contains("not found"));
    }

    // ==========================================
    // HELPER METHODS AND EDGE CASES
    // ==========================================

    private UserPost createTestPost(String id, String title, String content) {
        UserPost post = new UserPost();
        post.setId(id);
        post.setUserId(userId);
        post.setTitle(title);
        post.setContent(content);
        post.setTags(Arrays.asList("Test"));
        post.setPublic(true);
        post.setStatus("PUBLISHED");
        post.setDeleted(false);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        return post;
    }

    @Test
    @DisplayName("Edge Case: Create Post with Empty Tags List")
    void testCreatePost_EmptyTags() {
        // Arrange
        createPostRequest.setTags(Arrays.asList());

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        UserPostResponse response = userPostService.createPost(userId, createPostRequest);

        // Assert
        assertNotNull(response);
    }

    @Test
    @DisplayName("Edge Case: Create Private Post")
    void testCreatePost_PrivatePost() {
        // Arrange
        createPostRequest.setIsPublic(false);

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        UserPostResponse response = userPostService.createPost(userId, createPostRequest);

        // Assert
        assertNotNull(response);
        verify(userPostRepository).save(argThat(post -> !post.isPublic()));
    }

    @Test
    @DisplayName("Edge Case: Post with Image URLs")
    void testCreatePost_WithImageUrls() {
        // Arrange
        createPostRequest
                .setImageUrls(Arrays.asList("https://example.com/image1.jpg", "https://example.com/image2.jpg"));

        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        UserPostResponse response = userPostService.createPost(userId, createPostRequest);

        // Assert
        assertNotNull(response);
        verify(userPostRepository)
                .save(argThat(post -> post.getImageUrls() != null && post.getImageUrls().size() == 2));
    }

    @Test
    @DisplayName("Engagement: Verify Initial Counts")
    void testCreatePost_InitialEngagementCounts() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        UserPostResponse response = userPostService.createPost(userId, createPostRequest);

        // Assert
        assertEquals(0, response.getViewCount());
        assertEquals(0, response.getLikeCount());
        assertEquals(0, response.getCommentCount());
    }
}