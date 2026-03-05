package com.moroccantour.service;

import com.moroccantour.dto.request.UpdateUserStatusRequest;
import com.moroccantour.dto.response.PageResponse;
import com.moroccantour.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getProfile(String email);
    PageResponse<UserResponse> getAll(int page, int size);
    UserResponse updateStatus(Long id, UpdateUserStatusRequest request);
    void deleteUser(Long id);
    List<UserResponse> getPendingGuides();
    UserResponse approveGuide(Long id);
    void rejectGuide(Long id);
    UserResponse updateProfile(String email, java.util.Map<String, Object> updates);
}
