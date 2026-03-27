package com.moroccantour.controller;

import com.moroccantour.dto.request.CreateBookingRequest;
import com.moroccantour.dto.response.BookingResponse;
import com.moroccantour.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('TOURIST')")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.createBooking(request, userDetails.getUsername()));
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('TOURIST') or hasRole('GUIDE')")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        boolean isGuide = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_GUIDE"));

        if (isGuide) {
            return ResponseEntity.ok(bookingService.getGuideBookings(email));
        }
        return ResponseEntity.ok(bookingService.getMyBookings(email));
    }

    @GetMapping("/guide/tour/{tourId}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<List<BookingResponse>> getBookingsByTour(@PathVariable Long tourId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getBookingsByTour(tourId, userDetails.getUsername()));
    }

    @PutMapping("/guide/{bookingId}/confirm")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<BookingResponse> confirmBooking(@PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.confirmBooking(bookingId, userDetails.getUsername()));
    }

    @PutMapping("/guide/{bookingId}/reject")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<BookingResponse> rejectBooking(@PathVariable Long bookingId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.rejectBooking(bookingId, userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

}

    