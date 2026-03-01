package com.moroccantour.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateLanguageRequest(
        @NotBlank String name
) {}
