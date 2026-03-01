package com.moroccantour.dto.response;

public record TourImageResponse(
        Long id,
        String imageUrl,
        Integer displayOrder
) {}
