package com.moroccantour.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.moroccantour.dto.response.LanguageResponse;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String role,
        boolean active,
        String phone,
        String profileImage,
        String city,
        String bio,
        List<LanguageResponse> languages,
        Integer yearsOfExperience,
        LocalDateTime createdAt
) {}
