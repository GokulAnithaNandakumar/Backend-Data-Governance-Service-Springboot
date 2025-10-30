package com.datagovernance.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * DTO for creating a new post
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePostRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 10000, message = "Content must be between 1 and 10000 characters")
    private String content;

    private List<String> imageUrls;
    private List<String> tags;
    private Boolean isPublic = true;
    private String status = "PUBLISHED";
}