package com.moroccantour.dto.response;

import com.moroccantour.entity.enums.TourStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TourResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        Integer durationHours,
        String city,
        Integer maxParticipants,
        Integer availableSeats,
        TourStatus status,
        UserResponse guide,
        CategoryResponse category,
        List<TourImageResponse> images,
        String startLocationName,
        String endLocationName,
        LocalDateTime startDate,
        LocalDateTime endDate
) {}
