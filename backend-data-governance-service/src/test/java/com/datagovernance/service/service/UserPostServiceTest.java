package com.datagovernance.service.service;

import com.datagovernance.service.dto.CreatePostRequest;
import com.datagovernance.service.dto.UserPostResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.exception.ResourceNotFoundException;
import com.datagovernance.service.document.UserPost;
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
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserPostService
 * Tests all business rules related to FR8, FR9, and FR10
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("User Post Service Unit Tests")
class UserPostServiceTest {

    @Mock
    private UserPostRepository userPostRepository;

    @Mock
    private UserProfileService userProfileService;

    @InjectMocks
    private UserPostService userPostService;

    private CreatePostRequest validPostRequest;
    private UserPost existingPost;
    private String activeUserId = "active-user-id";
    private String postId = "existing-post-id";

    @BeforeEach
    void setUp() {
        validPostRequest = new CreatePostRequest();
        validPostRequest.setTitle("Test Post Title");
        validPostRequest.setContent("This is a test post content");
        validPostRequest.setTags(Arrays.asList("test"));
        validPostRequest.setIsPublic(true);

        existingPost = new UserPost();
        existingPost.setId(postId);
        existingPost.setUserId(activeUserId);
        existingPost.setTitle("Existing Post");
        existingPost.setContent("Existing content");
        existingPost.setDeleted(false);
        existingPost.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("FR8: Create Post - Success")
    void testCreatePost_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(activeUserId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(existingPost);

        // Act
        UserPostResponse response = userPostService.createPost(activeUserId, validPostRequest);

        // Assert
        assertNotNull(response);
        assertEquals(activeUserId, response.getUserId());
        verify(userProfileService).isUserActiveById(activeUserId);
        verify(userPostRepository).save(any(UserPost.class));
    }

    @Test
    @DisplayName("FR8: Create Post - User Not Active")
    void testCreatePost_UserNotActive() {
        // Arrange
        when(userProfileService.isUserActiveById(activeUserId)).thenReturn(false);

        // Act & Assert
        BusinessRuleViolationException exception = assertThrows(
                BusinessRuleViolationException.class,
                () -> userPostService.createPost(activeUserId, validPostRequest));

        assertEquals("Cannot create post for inactive or non-existent user", exception.getMessage());
        verify(userPostRepository, never()).save(any());
    }

    @Test
    @DisplayName("FR9: Get Posts by User ID - Success")
    void testGetPostsByUserId_Success() {
        // Arrange
        List<UserPost> posts = Arrays.asList(existingPost);
        when(userPostRepository.findByUserIdAndNotDeleted(activeUserId)).thenReturn(posts);

        // Act
        List<UserPostResponse> responses = userPostService.getPostsByUserId(activeUserId);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals(postId, responses.get(0).getId());
        verify(userPostRepository).findByUserIdAndNotDeleted(activeUserId);
    }

    @Test
    @DisplayName("FR10: Soft Delete Post - Success")
    void testSoftDeletePost_Success() {
        // Arrange
        when(userPostRepository.findById(postId)).thenReturn(Optional.of(existingPost));
        when(userPostRepository.save(any(UserPost.class))).thenReturn(existingPost);

        // Act
        assertDoesNotThrow(() -> userPostService.softDeletePost(postId));

        // Assert
        verify(userPostRepository).findById(postId);
        verify(userPostRepository).save(any(UserPost.class));
    }

    @Test
    @DisplayName("FR10: Soft Delete Post - Post Not Found")
    void testSoftDeletePost_NotFound() {
        // Arrange
        when(userPostRepository.findById(postId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userPostService.softDeletePost(postId));

        assertEquals("Post not found with ID: " + postId, exception.getMessage());
        verify(userPostRepository, never()).save(any());
    }

    @Test
    @DisplayName("Get Post by ID - Success")
    void testGetPostById_Success() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted(postId)).thenReturn(Optional.of(existingPost));

        // Act
        UserPostResponse response = userPostService.getPostById(postId);

        // Assert
        assertNotNull(response);
        assertEquals(postId, response.getId());
        verify(userPostRepository).findByIdAndNotDeleted(postId);
    }

    @Test
    @DisplayName("Get Post by ID - Not Found")
    void testGetPostById_NotFound() {
        // Arrange
        when(userPostRepository.findByIdAndNotDeleted(postId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userPostService.getPostById(postId));

        assertEquals("Post not found with ID: " + postId, exception.getMessage());
    }
}