package com.moroccantour.service;

import com.moroccantour.dto.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse guideStats(String email);
    DashboardStatsResponse adminStats();
}
