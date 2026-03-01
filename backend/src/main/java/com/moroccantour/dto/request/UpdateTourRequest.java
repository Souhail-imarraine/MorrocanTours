package com.moroccantour.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpdateTourRequest(
        @NotBlank String title,
        @NotBlank String description,
        @NotNull @Positive BigDecimal price,
        @NotNull @Positive Integer maxParticipants,
        @NotNull @Positive Integer durationHours,
        @NotNull LocalDateTime startDate,
        @NotNull LocalDateTime endDate,
        @NotBlank String city,
        String coverImage,
        @NotNull Long categoryId,
        String startLocationName,
        String endLocationName
) {}
