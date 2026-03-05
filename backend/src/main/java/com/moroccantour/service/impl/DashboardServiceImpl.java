package com.moroccantour.service.impl;

import com.moroccantour.dto.response.DashboardStatsResponse;
import com.moroccantour.entity.enums.Role;
import com.moroccantour.entity.enums.TourStatus;
import com.moroccantour.repository.BookingRepository;
import com.moroccantour.repository.TourRepository;
import com.moroccantour.repository.UserRepository;
import com.moroccantour.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
        public DashboardStatsResponse guideStats(String email) {
        var guide = userRepository.findByEmail(email)
            .orElseThrow(() -> new com.moroccantour.exception.NotFoundException("User not found"));

        var guideTours = tourRepository.findByGuideId(guide.getId());
        long totalTours = guideTours.size();
        long publishedTours = guideTours.stream().filter(t -> t.getStatus() == TourStatus.PUBLISHED).count();

        long totalBookings = bookingRepository.findByTourGuideId(guide.getId()).size();

        return new DashboardStatsResponse(
            totalTours,
            totalBookings,
            0L,
            publishedTours,
            0L,
            0L,
            0L
        );
    }

    @Override
    public DashboardStatsResponse adminStats() {
        long totalTours = tourRepository.count();
        long totalBookings = bookingRepository.count();
        long totalUsers = userRepository.count();
        long totalGuides = userRepository.findByRoleAndActive(Role.GUIDE, true).size();
        long pendingGuides = userRepository.findByRoleAndActive(Role.GUIDE, false).size();
        long activeTours = tourRepository.countByStatus(TourStatus.PUBLISHED);
        return new DashboardStatsResponse(
                totalTours,
                totalBookings,
                0L,
                activeTours,
                totalUsers,
                totalGuides,
                pendingGuides
        );
    }
}
