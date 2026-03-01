package com.moroccantour.dto.response;

public record DashboardStatsResponse(
        Long totalTours,
        Long totalBookings,
        Long totalRevenue,
        Long activeTours,
        Long totalUsers,
        Long totalGuides,
        Long pendingGuides
) {}
