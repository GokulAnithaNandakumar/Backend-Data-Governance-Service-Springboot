package com.datagovernance.service.document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * User Post document representing a post created by a user
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Document(collection = "user_posts")
public class UserPost extends BaseAuditDocument {

    @Id
    private String id;

    @NotNull(message = "User ID is required")
    @Indexed
    private String userId;

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 10000, message = "Content must be between 1 and 10000 characters")
    private String content;

    // Optional image URLs for the post
    private List<String> imageUrls;

    // Tags for categorization
    private List<String> tags;

    // Post visibility
    private boolean isPublic = true;

    // Post status
    private String status = "PUBLISHED"; // DRAFT, PUBLISHED, ARCHIVED

    // Engagement metrics
    private int viewCount = 0;
    private int likeCount = 0;
    private int commentCount = 0;

    public void incrementViewCount() {
        this.viewCount++;
    }

    public void incrementLikeCount() {
        this.likeCount++;
    }

    public void decrementLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void incrementCommentCount() {
        this.commentCount++;
    }

    public void decrementCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }
}