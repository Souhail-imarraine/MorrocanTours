package com.moroccantour.mapper;

import com.moroccantour.dto.request.CreateTourRequest;
import com.moroccantour.dto.request.UpdateTourRequest;
import com.moroccantour.dto.response.TourResponse;
import com.moroccantour.entity.Booking;
import com.moroccantour.entity.Tour;
import com.moroccantour.entity.enums.BookingStatus;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = MapperConfig.class, uses = {UserMapper.class, CategoryMapper.class, TourImageMapper.class})
public interface TourMapper {
    @Mapping(target = "availableSeats", expression = "java(availableSeats(tour))")
    TourResponse toResponse(Tour tour);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "guide", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Tour toEntity(CreateTourRequest request);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "guide", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "bookings", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UpdateTourRequest request, @MappingTarget Tour tour);

    default Integer availableSeats(Tour tour) {
        if (tour == null) return 0;
        int confirmed = 0;
        if (tour.getBookings() != null) {
            for (Booking b : tour.getBookings()) {
                if (!BookingStatus.CANCELLED.equals(b.getStatus())) {
                    confirmed += b.getNumberOfParticipants();
                }
            }
        }
        return Math.max(0, tour.getMaxParticipants() - confirmed);
    }
}
