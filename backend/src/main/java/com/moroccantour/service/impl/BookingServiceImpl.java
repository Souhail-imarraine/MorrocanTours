package com.moroccantour.service.impl;

import com.moroccantour.dto.request.CreateBookingRequest;
import com.moroccantour.dto.response.BookingResponse;
import com.moroccantour.entity.Booking;
import com.moroccantour.entity.Tour;
import com.moroccantour.entity.User;
import com.moroccantour.entity.enums.BookingStatus;
import com.moroccantour.entity.enums.Role;
import com.moroccantour.exception.BadRequestException;
import com.moroccantour.exception.ForbiddenException;
import com.moroccantour.exception.NotFoundException;
import com.moroccantour.mapper.BookingMapper;
import com.moroccantour.repository.BookingRepository;
import com.moroccantour.repository.TourRepository;
import com.moroccantour.repository.UserRepository;
import com.moroccantour.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request, String email) {
        User tourist = currentUser(email);
        ensureRole(tourist, Role.TOURIST);
        Tour tour = tourRepository.findById(request.tourId())
                .orElseThrow(() -> new NotFoundException("Tour not found"));
        BigDecimal total = tour.getPrice().multiply(BigDecimal.valueOf(request.numberOfParticipants()));
        Booking booking = bookingMapper.toEntity(request);
        booking.setTour(tour);
        booking.setTourist(tourist);
        booking.setBookingDate(LocalDateTime.now());
        booking.setTotalPrice(total);
        booking.setStatus(BookingStatus.PENDING);
        bookingRepository.save(booking);
        return bookingMapper.toResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings(String email) {
        User tourist = currentUser(email);
        ensureRole(tourist, Role.TOURIST);
        return bookingRepository.findByTouristId(tourist.getId()).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getGuideBookings(String email) {
        User guide = currentUser(email);
        ensureRole(guide, Role.GUIDE);
        return bookingRepository.findByTourGuideId(guide.getId()).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    public List<BookingResponse> getBookingsByTour(Long tourId, String email) {
        User guide = currentUser(email);
        ensureRole(guide, Role.GUIDE);
        Tour tour = tourRepository.findById(tourId).orElseThrow(() -> new NotFoundException("Tour not found"));
        if (!tour.getGuide().getId().equals(guide.getId())) {
            throw new ForbiddenException("Not your tour");
        }
        return bookingRepository.findByTourId(tourId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    public BookingResponse confirmBooking(Long bookingId, String email) {
        return updateStatus(bookingId, email, BookingStatus.CONFIRMED);
    }

    @Override
    public BookingResponse rejectBooking(Long bookingId, String email) {
        return updateStatus(bookingId, email, BookingStatus.CANCELLED);
    }

    private BookingResponse updateStatus(Long bookingId, String email, BookingStatus status) {
        User guide = currentUser(email);
        ensureRole(guide, Role.GUIDE);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (!booking.getTour().getGuide().getId().equals(guide.getId())) {
            throw new ForbiddenException("Not your booking");
        }
        if (status == BookingStatus.PENDING) {
            throw new BadRequestException("Cannot revert to pending");
        }
        booking.setStatus(status);
        bookingRepository.save(booking);
        return bookingMapper.toResponse(booking);
    }

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    private void ensureRole(User user, Role requiredRole) {
        if (user == null || user.getRole() != requiredRole) {
            throw new ForbiddenException(requiredRole.name() + " role required");
        }
    }
}
