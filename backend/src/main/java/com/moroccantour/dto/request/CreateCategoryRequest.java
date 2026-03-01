package com.moroccantour.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
        @NotBlank String name,
        String description,
        String icon
) {}
