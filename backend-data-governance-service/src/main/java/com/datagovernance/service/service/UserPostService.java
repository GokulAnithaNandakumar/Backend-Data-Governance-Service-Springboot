package com.datagovernance.service.service;

import com.datagovernance.service.document.UserPost;
import com.datagovernance.service.dto.CreatePostRequest;
import com.datagovernance.service.dto.UserPostResponse;
import com.datagovernance.service.exception.BusinessRuleViolationException;
import com.datagovernance.service.exception.ResourceNotFoundException;
import com.datagovernance.service.repository.UserPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service class for managing User Posts
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserPostService {

    private final UserPostRepository userPostRepository;
    private final UserProfileService userProfileService;

    /**
     * Creates a new post for a user
     */
    @Transactional
    public UserPostResponse createPost(String userId, CreatePostRequest request) {
        log.info("Creating new post for user ID: {}", userId);

        // Business Rule 9: Post Creation Integrity
        if (!userProfileService.isUserActiveById(userId)) {
            throw new BusinessRuleViolationException("Cannot create post for inactive or non-existent user");
        }

        UserPost post = new UserPost();
        post.setUserId(userId);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrls(request.getImageUrls());
        post.setTags(request.getTags());

        if (request.getIsPublic() != null) {
            post.setPublic(request.getIsPublic());
        }
        if (request.getStatus() != null) {
            post.setStatus(request.getStatus());
        }

        UserPost savedPost = userPostRepository.save(post);
        log.info("Post created successfully with ID: {} for user ID: {}", savedPost.getId(), userId);

        return mapToResponse(savedPost);
    }

    /**
     * Retrieves all posts for a user (excluding soft-deleted)
     */
    public List<UserPostResponse> getPostsByUserId(String userId) {
        log.info("Retrieving posts for user ID: {}", userId);

        // Verify user exists and is active
        if (!userProfileService.isUserActiveById(userId)) {
            throw new ResourceNotFoundException("User", userId);
        }

        List<UserPost> posts = userPostRepository.findByUserIdAndNotDeleted(userId);
        return posts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Soft deletes a post
     */
    @Transactional
    public void softDeletePost(String postId) {
        log.info("Soft deleting post with ID: {}", postId);

        UserPost post = userPostRepository.findByIdAndNotDeleted(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));

        post.markAsDeleted();
        userPostRepository.save(post);

        log.info("Post soft deleted successfully with ID: {}", postId);
    }

    /**
     * Retrieves a single post by ID (excluding soft-deleted)
     */
    public UserPostResponse getPostById(String postId) {
        log.info("Retrieving post with ID: {}", postId);

        UserPost post = userPostRepository.findByIdAndNotDeleted(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", postId));

        return mapToResponse(post);
    }

    /**
     * Retrieves all posts (including soft-deleted for admin purposes)
     */
    public List<UserPostResponse> getAllPosts() {
        log.info("Retrieving all posts");

        List<UserPost> posts = userPostRepository.findAll();
        return posts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Maps UserPost entity to UserPostResponse DTO
     */
    private UserPostResponse mapToResponse(UserPost post) {
        UserPostResponse response = new UserPostResponse();
        response.setId(post.getId());
        response.setUserId(post.getUserId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setImageUrls(post.getImageUrls());
        response.setTags(post.getTags());
        response.setPublic(post.isPublic());
        response.setStatus(post.getStatus());
        response.setViewCount(post.getViewCount());
        response.setLikeCount(post.getLikeCount());
        response.setCommentCount(post.getCommentCount());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());
        return response;
    }
}