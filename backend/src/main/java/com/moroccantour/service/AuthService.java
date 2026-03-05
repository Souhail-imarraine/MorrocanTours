package com.moroccantour.service;

import com.moroccantour.dto.request.LoginRequest;
import com.moroccantour.dto.request.RegisterGuideRequest;
import com.moroccantour.dto.request.RegisterTouristRequest;
import com.moroccantour.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse registerTourist(RegisterTouristRequest request);
    AuthResponse registerGuide(RegisterGuideRequest request);
    AuthResponse currentUser();
}
