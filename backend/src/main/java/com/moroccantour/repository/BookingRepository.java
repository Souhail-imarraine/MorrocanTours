package com.moroccantour.repository;

import com.moroccantour.entity.Booking;
import com.moroccantour.entity.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Page<Booking> findByTouristId(Long touristId, Pageable pageable);

    Page<Booking> findByTourId(Long tourId, Pageable pageable);

    List<Booking> findByTouristId(Long touristId);

    List<Booking> findByTourGuideId(Long guideId);

    List<Booking> findByTourId(Long tourId);

    long countByStatus(BookingStatus status);

    boolean existsByTourIdAndTouristIdAndStatusNot(Long tourId, Long touristId, BookingStatus status);

    long countByTouristIdAndStatusNot(Long touristId, BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.numberOfParticipants), 0) FROM Booking b WHERE b.tour.id = :tourId AND b.status <> :status")
    Integer sumParticipantsByTourIdAndStatusNotCancelled(@Param("tourId") Long tourId, @Param("status") BookingStatus status);
}
