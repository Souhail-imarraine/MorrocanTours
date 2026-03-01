package com.moroccantour.dto.response;

import com.moroccantour.entity.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        LocalDateTime bookingDate,
        BigDecimal totalPrice,
        Integer numberOfParticipants,
        BookingStatus status,
        UserResponse tourist,
        TourResponse tour
) {}
