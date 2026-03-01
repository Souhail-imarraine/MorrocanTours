package com.moroccantour.dto.response;

public record AuthResponse(
        String token,
        Long id,
        String email,
        String firstName,
        String lastName,
        String role,
        boolean active,
        String profileImage
) {}
