package com.datagovernance.service.integration;

import com.datagovernance.service.dto.*;
import com.datagovernance.service.document.UserPost;
import com.datagovernance.service.document.UserPreferences;
import com.datagovernance.service.document.UserProfile;
import com.datagovernance.service.document.UserRole;
import com.datagovernance.service.repository.UserPostRepository;
import com.datagovernance.service.repository.UserPreferencesRepository;
import com.datagovernance.service.repository.UserProfileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive Integration Tests for all Functional Requirements (FR1-FR10)
 * Tests the complete API contract and all business rules from the PRD
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DisplayName("Complete API Integration Tests - All FR1-FR10")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CompleteApiIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    @Autowired
    private UserPostRepository userPostRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String baseUrl;

    // Test data holders
    private String createdUserId;
    private String createdPostId;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/v1";
        // Clean database before each test
        userPostRepository.deleteAll();
        userPreferencesRepository.deleteAll();
        userProfileRepository.deleteAll();
    }

    // ==========================================
    // FR1: POST /api/v1/users - CREATE USER
    // ==========================================

    @Test
    @Order(1)
    @DisplayName("FR1: Create User - Success with all business rules")
    void testCreateUser_Success() {
        // Arrange
        CreateUserRequest request = createValidUserRequest();

        // Act
        ResponseEntity<UserProfileResponse> response = restTemplate.postForEntity(
                baseUrl + "/users",
                request,
                UserProfileResponse.class);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());

        UserProfileResponse created = response.getBody();
        assertEquals("testuser123", created.getUsername());
        assertEquals("test@example.com", created.getEmail());
        assertEquals("John", created.getFirstName());
        assertEquals("Doe", created.getLastName());
        assertEquals("John Doe", created.getFullName());
        assertTrue(created.getRoles().contains(UserRole.USER));
        assertNotNull(created.getCreatedAt());
        assertNotNull(created.getAuditTrail());

        // Store for subsequent tests
        createdUserId = created.getId();
    }

    @Test
    @Order(2)
    @DisplayName("FR1: Create User - Business Rule 1: Data Completeness Validation")
    void testCreateUser_MissingMandatoryFields() {
        // Test missing username
        CreateUserRequest request = createValidUserRequest();
        request.setUsername(null);

        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users",
                request,
                String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

        // Test missing email
        request = createValidUserRequest();
        request.setEmail(null);

        response = restTemplate.postForEntity(
                baseUrl + "/users",
                request,
                String.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @Order(3)
    @DisplayName("FR1: Create User - Business Rule 2: Email Format Validation")
    void testCreateUser_InvalidEmailFormat() {
        // Arrange
        CreateUserRequest request = createValidUserRequest();
        request.setEmail("invalid-email-format");

        // Act
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users",
                request,
                String.class);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @Order(4)
    @DisplayName("FR1: Create User - Business Rule 3: Role Validation")
    void testCreateUser_MissingRoles() {
        // Arrange
        CreateUserRequest request = createValidUserRequest();
        request.setRoles(new HashSet<>()); // Empty roles

        // Act
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users",
                request,
                String.class);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    @Order(5)
    @DisplayName("FR1: Create User - Business Rule 4: Username Uniqueness Check")
    void testCreateUser_DuplicateUsername() {
        // Arrange - Create first user
        CreateUserRequest request1 = createValidUserRequest();
        restTemplate.postForEntity(baseUrl + "/users", request1, UserProfileResponse.class);

        // Try to create user with same username
        CreateUserRequest request2 = createValidUserRequest();
        request2.setEmail("different@example.com");

        // Act
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users",
                request2,
                String.class);

        // Assert
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    @Test
    @Order(6)
    @DisplayName("FR1: Create User - Business Rule 4: Email Uniqueness Check")
    void testCreateUser_DuplicateEmail() {
        // Arrange - Create first user
        CreateUserRequest request1 = createValidUserRequest();
        restTemplate.postForEntity(baseUrl + "/users", request1, UserProfileResponse.class);

        // Try to create user with same email
        CreateUserRequest request2 = createValidUserRequest();
        request2.setUsername("differentuser");

        // Act
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users",
                request2,
                String.class);

        // Assert
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    }

    // ==========================================
    // FR2: GET /api/v1/users/{userId} - READ USER
    // ==========================================

    @Test
    @Order(7)
    @DisplayName("FR2: Get User - Success")
    void testGetUser_Success() {
        // Arrange - Create a user first
        String userId = createTestUser();

        // Act
        ResponseEntity<UserProfileResponse> response = restTemplate.getForEntity(
                baseUrl + "/users/" + userId,
                UserProfileResponse.class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getId());
    }

    @Test
    @Order(8)
    @DisplayName("FR2: Get User - Business Rule 5: Soft Deletion Read Filter")
    void testGetUser_SoftDeletedUser_NotFound() {
        // Arrange - Create and soft delete a user
        String userId = createTestUser();
        restTemplate.delete(baseUrl + "/users/" + userId);

        // Act
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/users/" + userId,
                String.class);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @Order(9)
    @DisplayName("FR2: Get User - Non-existent User")
    void testGetUser_NotFound() {
        // Act
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/users/nonexistent-id",
                String.class);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // ==========================================
    // FR3: PUT /api/v1/users/{userId} - UPDATE USER
    // ==========================================

    @Test
    @Order(10)
    @DisplayName("FR3: Update User - Success with Business Rule 6: Timestamp Enforcement")
    void testUpdateUser_Success() {
        // Arrange - Create a user first
        String userId = createTestUser();

        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setFirstName("Jane");
        updateRequest.setLastName("Smith");
        updateRequest.setBio("Updated bio");

        // Act
        ResponseEntity<UserProfileResponse> response = restTemplate.exchange(
                baseUrl + "/users/" + userId,
                HttpMethod.PUT,
                new HttpEntity<>(updateRequest),
                UserProfileResponse.class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Jane", response.getBody().getFirstName());
        assertEquals("Smith", response.getBody().getLastName());
        assertEquals("Updated bio", response.getBody().getBio());
        assertNotNull(response.getBody().getUpdatedAt());

        // Verify audit trail (Business Rule 8)
        assertNotNull(response.getBody().getAuditTrail());
        assertTrue(response.getBody().getAuditTrail().size() >= 2); // CREATE + UPDATE
    }

    @Test
    @Order(11)
    @DisplayName("FR3: Update User - Non-existent User")
    void testUpdateUser_NotFound() {
        // Arrange
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setFirstName("Jane");

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/users/nonexistent-id",
                HttpMethod.PUT,
                new HttpEntity<>(updateRequest),
                String.class);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // ==========================================
    // FR4: DELETE /api/v1/users/{userId} - SOFT DELETE USER
    // ==========================================

    @Test
    @Order(12)
    @DisplayName("FR4: Soft Delete User - Success with Business Rule 11: Cascading Soft Deletion")
    void testSoftDeleteUser_WithCascadingDeletion() {
        // Arrange - Create user and posts
        String userId = createTestUser();
        String postId1 = createTestPost(userId);
        String postId2 = createTestPost(userId);

        // Act - Soft delete user
        ResponseEntity<OperationAcknowledgmentResponse> response = restTemplate.exchange(
                baseUrl + "/users/" + userId,
                HttpMethod.DELETE,
                null,
                OperationAcknowledgmentResponse.class);

        // Assert - User soft deleted
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SOFT_DELETE", response.getBody().getOperationType());
        assertEquals(userId, response.getBody().getResourceId());

        // Verify user is not accessible via GET (Business Rule 5)
        ResponseEntity<String> getUserResponse = restTemplate.getForEntity(
                baseUrl + "/users/" + userId,
                String.class);
        assertEquals(HttpStatus.NOT_FOUND, getUserResponse.getStatusCode());

        // Verify posts are cascaded soft deleted (Business Rule 11)
        ResponseEntity<UserPostResponse[]> getPostsResponse = restTemplate.getForEntity(
                baseUrl + "/users/" + userId + "/posts",
                UserPostResponse[].class);
        assertEquals(HttpStatus.NOT_FOUND, getPostsResponse.getStatusCode()); // User not found, so can't get posts

        // Verify posts are actually soft-deleted in database
        Optional<UserPost> post1 = userPostRepository.findById(postId1);
        Optional<UserPost> post2 = userPostRepository.findById(postId2);
        assertTrue(post1.isPresent() && post1.get().isDeleted());
        assertTrue(post2.isPresent() && post2.get().isDeleted());
    }

    // ==========================================
    // FR5: POST /api/v1/users/{userId}/purge - HARD DELETE USER
    // ==========================================

    @Test
    @Order(13)
    @DisplayName("FR5: Hard Delete User - Business Rule 7: Grace Period Check - Should Fail")
    void testHardDeleteUser_GracePeriodNotElapsed() {
        // Arrange - Create and immediately soft delete user
        String userId = createTestUser();
        restTemplate.delete(baseUrl + "/users/" + userId);

        // Act - Try to hard delete immediately (grace period not elapsed)
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users/" + userId + "/purge",
                null,
                String.class);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    @Order(14)
    @DisplayName("FR5: Hard Delete User - Business Rule 12: Cascading Hard Deletion")
    void testHardDeleteUser_WithCascadingDeletion() {
        // Arrange - Create user, preferences, and posts
        String userId = createTestUser();
        createTestPreferences(userId);
        String postId = createTestPost(userId);

        // Soft delete user first
        restTemplate.delete(baseUrl + "/users/" + userId);

        // Manually set deletion time to past (simulate grace period elapsed)
        UserProfile user = userProfileRepository.findById(userId).orElseThrow();
        user.setDeletedAt(LocalDateTime.now().minusHours(25)); // Beyond 24 hour grace period
        userProfileRepository.save(user);

        // Act - Hard delete user
        ResponseEntity<OperationAcknowledgmentResponse> response = restTemplate.postForEntity(
                baseUrl + "/users/" + userId + "/purge",
                null,
                OperationAcknowledgmentResponse.class);

        // Assert - User hard deleted
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("HARD_DELETE", response.getBody().getOperationType());

        // Verify complete removal from database (Business Rule 12)
        assertFalse(userProfileRepository.findById(userId).isPresent());
        assertFalse(userPreferencesRepository.findByUserId(userId).isPresent());
        assertFalse(userPostRepository.findById(postId).isPresent());
    }

    // ==========================================
    // FR6: PUT /api/v1/users/{userId}/preferences - UPDATE PREFERENCES
    // ==========================================

    @Test
    @Order(15)
    @DisplayName("FR6: Update Preferences - Success")
    void testUpdatePreferences_Success() {
        // Arrange
        String userId = createTestUser();
        UpdatePreferencesRequest request = createValidPreferencesRequest();

        // Act
        ResponseEntity<UserPreferencesResponse> response = restTemplate.exchange(
                baseUrl + "/users/" + userId + "/preferences",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                UserPreferencesResponse.class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getUserId());
        assertEquals("dark", response.getBody().getTheme());
        assertEquals("en", response.getBody().getLanguage());
        assertTrue(response.getBody().isEmailNotifications());
    }

    @Test
    @Order(16)
    @DisplayName("FR6: Update Preferences - Business Rule 10: User Existence Check")
    void testUpdatePreferences_UserNotFound() {
        // Arrange
        UpdatePreferencesRequest request = createValidPreferencesRequest();

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/users/nonexistent-id/preferences",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                String.class);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @Order(17)
    @DisplayName("FR6: Update Preferences - Business Rule 10: Active Check")
    void testUpdatePreferences_SoftDeletedUser() {
        // Arrange - Create and soft delete user
        String userId = createTestUser();
        restTemplate.delete(baseUrl + "/users/" + userId);

        UpdatePreferencesRequest request = createValidPreferencesRequest();

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/users/" + userId + "/preferences",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                String.class);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // ==========================================
    // FR7: GET /api/v1/users/{userId}/preferences - READ PREFERENCES
    // ==========================================

    @Test
    @Order(18)
    @DisplayName("FR7: Get Preferences - Success")
    void testGetPreferences_Success() {
        // Arrange - Create user and preferences
        String userId = createTestUser();
        createTestPreferences(userId);

        // Act
        ResponseEntity<UserPreferencesResponse> response = restTemplate.getForEntity(
                baseUrl + "/users/" + userId + "/preferences",
                UserPreferencesResponse.class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getUserId());
    }

    @Test
    @Order(19)
    @DisplayName("FR7: Get Preferences - Create Default When None Exist")
    void testGetPreferences_CreateDefault() {
        // Arrange - Create user without preferences
        String userId = createTestUser();

        // Act
        ResponseEntity<UserPreferencesResponse> response = restTemplate.getForEntity(
                baseUrl + "/users/" + userId + "/preferences",
                UserPreferencesResponse.class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getUserId());
        // Should have default values
        assertNotNull(response.getBody().getTheme());
        assertNotNull(response.getBody().getLanguage());
    }

    // ==========================================
    // FR8: POST /api/v1/users/{userId}/posts - CREATE POST
    // ==========================================

    @Test
    @Order(20)
    @DisplayName("FR8: Create Post - Success")
    void testCreatePost_Success() {
        // Arrange
        String userId = createTestUser();
        CreatePostRequest request = createValidPostRequest();

        // Act
        ResponseEntity<UserPostResponse> response = restTemplate.postForEntity(
                baseUrl + "/users/" + userId + "/posts",
                request,
                UserPostResponse.class);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(userId, response.getBody().getUserId());
        assertEquals("Test Post Title", response.getBody().getTitle());
        assertEquals("Test post content", response.getBody().getContent());
        assertNotNull(response.getBody().getCreatedAt());

        createdPostId = response.getBody().getId();
    }

    @Test
    @Order(21)
    @DisplayName("FR8: Create Post - Business Rule 9: User Existence Check")
    void testCreatePost_UserNotFound() {
        // Arrange
        CreatePostRequest request = createValidPostRequest();

        // Act
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users/nonexistent-id/posts",
                request,
                String.class);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    @Order(22)
    @DisplayName("FR8: Create Post - Business Rule 9: Active User Check")
    void testCreatePost_SoftDeletedUser() {
        // Arrange - Create and soft delete user
        String userId = createTestUser();
        restTemplate.delete(baseUrl + "/users/" + userId);

        CreatePostRequest request = createValidPostRequest();

        // Act
        ResponseEntity<String> response = restTemplate.postForEntity(
                baseUrl + "/users/" + userId + "/posts",
                request,
                String.class);

        // Assert
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    // ==========================================
    // FR9: GET /api/v1/users/{userId}/posts - READ POSTS
    // ==========================================

    @Test
    @Order(23)
    @DisplayName("FR9: Get Posts - Success with Business Rule 5: Soft Deletion Filter")
    void testGetPosts_Success() {
        // Arrange - Create user and multiple posts
        String userId = createTestUser();
        String postId1 = createTestPost(userId);
        String postId2 = createTestPost(userId);

        // Soft delete one post
        restTemplate.delete(baseUrl + "/posts/" + postId2);

        // Act
        ResponseEntity<UserPostResponse[]> response = restTemplate.getForEntity(
                baseUrl + "/users/" + userId + "/posts",
                UserPostResponse[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().length); // Only non-soft-deleted post
        assertEquals(postId1, response.getBody()[0].getId());
    }

    @Test
    @Order(24)
    @DisplayName("FR9: Get Posts - Empty List for User with No Posts")
    void testGetPosts_EmptyList() {
        // Arrange - Create user without posts
        String userId = createTestUser();

        // Act
        ResponseEntity<UserPostResponse[]> response = restTemplate.getForEntity(
                baseUrl + "/users/" + userId + "/posts",
                UserPostResponse[].class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().length);
    }

    // ==========================================
    // FR10: DELETE /api/v1/posts/{postId} - SOFT DELETE POST
    // ==========================================

    @Test
    @Order(25)
    @DisplayName("FR10: Soft Delete Post - Success with Business Rule 6: Timestamp Enforcement")
    void testSoftDeletePost_Success() {
        // Arrange - Create user and post
        String userId = createTestUser();
        String postId = createTestPost(userId);

        // Act
        ResponseEntity<OperationAcknowledgmentResponse> response = restTemplate.exchange(
                baseUrl + "/posts/" + postId,
                HttpMethod.DELETE,
                null,
                OperationAcknowledgmentResponse.class);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("SOFT_DELETE", response.getBody().getOperationType());
        assertEquals(postId, response.getBody().getResourceId());

        // Verify post is no longer returned in user posts list
        ResponseEntity<UserPostResponse[]> getPostsResponse = restTemplate.getForEntity(
                baseUrl + "/users/" + userId + "/posts",
                UserPostResponse[].class);
        assertEquals(0, getPostsResponse.getBody().length);

        // Verify post is marked as deleted in database with timestamp
        Optional<UserPost> deletedPost = userPostRepository.findById(postId);
        assertTrue(deletedPost.isPresent());
        assertTrue(deletedPost.get().isDeleted());
        assertNotNull(deletedPost.get().getDeletedAt());
    }

    @Test
    @Order(26)
    @DisplayName("FR10: Soft Delete Post - Post Not Found")
    void testSoftDeletePost_NotFound() {
        // Act
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/posts/nonexistent-id",
                HttpMethod.DELETE,
                null,
                String.class);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    // ==========================================
    // Helper Methods
    // ==========================================

    private CreateUserRequest createValidUserRequest() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("testuser123");
        request.setEmail("test@example.com");
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setRoles(Set.of(UserRole.USER));
        request.setBio("Test user bio");
        return request;
    }

    private UpdatePreferencesRequest createValidPreferencesRequest() {
        UpdatePreferencesRequest request = new UpdatePreferencesRequest();
        request.setTheme("dark");
        request.setLanguage("en");
        request.setEmailNotifications(true);
        request.setPushNotifications(false);
        request.setSmsNotifications(false);
        request.setProfileVisible(true);
        request.setShowEmail(false);
        request.setShowLastSeen(true);
        request.setContentFilter("moderate");
        return request;
    }

    private CreatePostRequest createValidPostRequest() {
        CreatePostRequest request = new CreatePostRequest();
        request.setTitle("Test Post Title");
        request.setContent("Test post content");
        request.setTags(Arrays.asList("test", "integration"));
        request.setIsPublic(true);
        request.setStatus("published");
        return request;
    }

    private String createTestUser() {
        CreateUserRequest request = createValidUserRequest();
        request.setUsername("user_" + System.currentTimeMillis()); // Ensure uniqueness
        request.setEmail("user_" + System.currentTimeMillis() + "@example.com");

        ResponseEntity<UserProfileResponse> response = restTemplate.postForEntity(
                baseUrl + "/users",
                request,
                UserProfileResponse.class);

        return response.getBody().getId();
    }

    private String createTestPost(String userId) {
        CreatePostRequest request = createValidPostRequest();
        request.setTitle("Post_" + System.currentTimeMillis()); // Ensure uniqueness

        ResponseEntity<UserPostResponse> response = restTemplate.postForEntity(
                baseUrl + "/users/" + userId + "/posts",
                request,
                UserPostResponse.class);

        return response.getBody().getId();
    }

    private void createTestPreferences(String userId) {
        UpdatePreferencesRequest request = createValidPreferencesRequest();

        restTemplate.exchange(
                baseUrl + "/users/" + userId + "/preferences",
                HttpMethod.PUT,
                new HttpEntity<>(request),
                UserPreferencesResponse.class);
    }
}