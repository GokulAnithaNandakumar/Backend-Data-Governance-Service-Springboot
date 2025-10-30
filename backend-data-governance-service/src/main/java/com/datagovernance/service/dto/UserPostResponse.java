package com.datagovernance.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for post response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPostResponse {

    private String id;
    private String userId;
    private String title;
    private String content;
    private List<String> imageUrls;
    private List<String> tags;
    private boolean isPublic;
    private String status;
    private int viewCount;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}