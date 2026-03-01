package com.moroccantour.dto.request;

import com.moroccantour.entity.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingStatusRequest(@NotNull BookingStatus status) {}
