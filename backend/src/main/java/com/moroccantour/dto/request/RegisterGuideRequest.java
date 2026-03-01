package com.moroccantour.dto.request;

import jakarta.validation.constraints.*;

import java.util.List;

public record RegisterGuideRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        @Size(min = 6) String password,
        @NotBlank String phone,
        @NotBlank String city,
        String bio,
        @NotEmpty List<Long> languageIds,
        @NotNull @Min(0) @Max(60) Integer yearsOfExperience,
        String profileImagePath
) {}
