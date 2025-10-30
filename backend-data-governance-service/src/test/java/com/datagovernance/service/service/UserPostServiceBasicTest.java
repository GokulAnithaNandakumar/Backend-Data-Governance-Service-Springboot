package com.datagovernance.service.service;

import com.datagovernance.service.document.UserPost;
import com.datagovernance.service.dto.CreatePostRequest;
import com.datagovernance.service.dto.UserPostResponse;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Simple Unit Tests for UserPostService - Testing Basic Functionality
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserPostService Basic Tests")
class UserPostServiceBasicTest {

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
        createPostRequest = new CreatePostRequest();
        createPostRequest.setTitle("Test Post");
        createPostRequest.setContent("Test Content");
        createPostRequest.setTags(Arrays.asList("test", "java"));

        userPost = new UserPost();
        userPost.setId(postId);
        userPost.setUserId(userId);
        userPost.setTitle("Test Post");
        userPost.setContent("Test Content");
        userPost.setTags(Arrays.asList("test", "java"));
        userPost.setDeleted(false);
        userPost.setCreatedAt(LocalDateTime.now());
        userPost.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("FR8: Create Post - Success")
    void testCreatePost_Success() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.save(any(UserPost.class))).thenReturn(userPost);

        // Act
        UserPostResponse response = userPostService.createPost(userId, createPostRequest);

        // Assert
        assertNotNull(response);
        assertEquals(postId, response.getId());
        assertEquals("Test Post", response.getTitle());
        assertEquals(userId, response.getUserId());

        verify(userProfileService).isUserActiveById(userId);
        verify(userPostRepository).save(any(UserPost.class));
    }

    @Test
    @DisplayName("FR8: Create Post - Inactive User")
    void testCreatePost_InactiveUser() {
        // Arrange
        when(userProfileService.isUserActiveById(userId)).thenReturn(false);

        // Act & Assert
        assertThrows(Exception.class, () -> {
            userPostService.createPost(userId, createPostRequest);
        });

        verify(userProfileService).isUserActiveById(userId);
        verify(userPostRepository, never()).save(any(UserPost.class));
    }

    @Test
    @DisplayName("FR9: Get User Posts - Success")
    void testGetUserPosts_Success() {
        // Arrange
        List<UserPost> posts = Arrays.asList(userPost);
        when(userProfileService.isUserActiveById(userId)).thenReturn(true);
        when(userPostRepository.findByUserIdAndNotDeleted(userId)).thenReturn(posts);

        // Act
        List<UserPostResponse> responses = userPostService.getPostsByUserId(userId);

        // Assert
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("Test Post", responses.get(0).getTitle());

        verify(userProfileService).isUserActiveById(userId);
        verify(userPostRepository).findByUserIdAndNotDeleted(userId);
    }
}