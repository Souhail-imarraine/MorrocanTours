package com.moroccantour.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateBookingRequest(
        @NotNull Long tourId,
        @NotNull @Positive Integer numberOfParticipants,
        String specialRequests
) {}
