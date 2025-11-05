package com.datagovernance.service.controller;

import com.datagovernance.service.dto.CreatePostRequest;
import com.datagovernance.service.dto.OperationAcknowledgmentResponse;
import com.datagovernance.service.dto.UserPostResponse;
import com.datagovernance.service.service.UserPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * REST Controller for User Posts operations
 * Implements endpoints FR8-FR10 from the PRD
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@Validated
public class UserPostController {

    private final UserPostService userPostService;

    /**
     * FR8: POST /api/v1/users/{userId}/posts - CREATE POST
     * Creates a new Post associated with the given User ID
     */
    @PostMapping("/users/{userId}/posts")
    public ResponseEntity<UserPostResponse> createPost(@PathVariable String userId,
            @Valid @RequestBody CreatePostRequest request) {

        log.info("Received request to create post for user ID: {}", userId);
        UserPostResponse response = userPostService.createPost(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * FR9: GET /api/v1/users/{userId}/posts - READ POSTS
     * Retrieves all non-soft-deleted Posts for a given User ID
     */
    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<UserPostResponse>> getPostsByUserId(@PathVariable String userId) {
        log.info("Received request to get posts for user ID: {}", userId);
        List<UserPostResponse> response = userPostService.getPostsByUserId(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/posts - READ ALL POSTS
     * Retrieves all posts (including soft-deleted for admin purposes)
     */
    @GetMapping("/posts")
    public ResponseEntity<List<UserPostResponse>> getAllPosts() {
        log.info("Received request to get all posts");
        List<UserPostResponse> response = userPostService.getAllPosts();
        return ResponseEntity.ok(response);
    }

    /**
     * FR10: DELETE /api/v1/posts/{postId} - SOFT DELETE POST
     * Marks the Post Entity as deleted
     */
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<OperationAcknowledgmentResponse> softDeletePost(@PathVariable String postId) {
        log.info("Received request to soft delete post with ID: {}", postId);
        userPostService.softDeletePost(postId);

        OperationAcknowledgmentResponse response = OperationAcknowledgmentResponse.success(
                "SOFT_DELETE",
                postId,
                "Post has been successfully soft deleted. The post is now marked as deleted and will not appear in listings.");

        return ResponseEntity.ok(response);
    }

    /**
     * Additional endpoint to get a single post by ID
     */
    @GetMapping("/posts/{postId}")
    public ResponseEntity<UserPostResponse> getPostById(@PathVariable String postId) {
        log.info("Received request to get post with ID: {}", postId);
        UserPostResponse response = userPostService.getPostById(postId);
        return ResponseEntity.ok(response);
    }
}