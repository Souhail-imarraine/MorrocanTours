package com.moroccantour.service;

import com.moroccantour.dto.request.CreateBookingRequest;
import com.moroccantour.dto.response.BookingResponse;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(CreateBookingRequest request, String email);
    List<BookingResponse> getMyBookings(String email);
    List<BookingResponse> getGuideBookings(String email);
    List<BookingResponse> getBookingsByTour(Long tourId, String email);
    BookingResponse confirmBooking(Long bookingId, String email);
    BookingResponse rejectBooking(Long bookingId, String email);
}
