package com.moroccantour.service.impl;

import com.moroccantour.dto.request.LoginRequest;
import com.moroccantour.dto.request.RegisterGuideRequest;
import com.moroccantour.dto.request.RegisterTouristRequest;
import com.moroccantour.dto.response.AuthResponse;
import com.moroccantour.entity.User;
import com.moroccantour.entity.enums.Role;
import com.moroccantour.exception.BadRequestException;
import com.moroccantour.mapper.UserMapper;
import com.moroccantour.repository.LanguageRepository;
import com.moroccantour.repository.UserRepository;
import com.moroccantour.security.JwtService;
import com.moroccantour.security.UserPrincipal;
import com.moroccantour.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final LanguageRepository languageRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        User user = ((UserPrincipal) authentication.getPrincipal()).user();
        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    @Override
    public AuthResponse registerTourist(RegisterTouristRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.TOURIST);
        user.setActive(true);
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return toAuthResponse(user, token);
    }

    @Override
    public AuthResponse registerGuide(RegisterGuideRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.GUIDE);
        user.setActive(false);
        var ids = request.languageIds() == null ? java.util.List.<Long>of() : request.languageIds();
        var languages = languageRepository.findAllById(ids);
        if (ids.size() != languages.size()) {
            throw new BadRequestException("One or more languages not found");
        }
        user.setLanguages(new java.util.HashSet<>(languages));
        userRepository.save(user);
        return toAuthResponse(user, null);
    }

    @Override
    public AuthResponse currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            throw new BadRequestException("User not authenticated");
        }
        User user = principal.user();
        return toAuthResponse(user, null);
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.isActive(),
                user.getProfileImage()
        );
    }
}
