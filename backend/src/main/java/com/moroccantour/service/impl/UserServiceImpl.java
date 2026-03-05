package com.moroccantour.service.impl;

import com.moroccantour.dto.request.UpdateUserStatusRequest;
import com.moroccantour.dto.response.PageResponse;
import com.moroccantour.dto.response.UserResponse;
import com.moroccantour.entity.User;
import com.moroccantour.entity.enums.Role;
import com.moroccantour.exception.NotFoundException;
import com.moroccantour.mapper.UserMapper;
import com.moroccantour.repository.LanguageRepository;
import com.moroccantour.repository.UserRepository;
import com.moroccantour.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final LanguageRepository languageRepository;
    private final UserMapper userMapper;

    @Override
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public PageResponse<UserResponse> getAll(int page, int size) {
        var pageable = PageRequest.of(page, size);
        var result = userRepository.findAll(pageable).map(userMapper::toResponse);
        return new com.moroccantour.dto.response.PageResponse<>(
            result.getContent(),
            result.getTotalElements(),
            result.getTotalPages(),
            result.getSize(),
            result.getNumber()
        );
    }

    @Override
    public UserResponse updateStatus(Long id, UpdateUserStatusRequest request) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
        user.setActive(request.active());
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<UserResponse> getPendingGuides() {
        return userRepository.findByRoleAndActive(Role.GUIDE, false).stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponse approveGuide(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Guide not found"));
        user.setActive(true);
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public void rejectGuide(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserResponse updateProfile(String email, Map<String, Object> updates) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));

        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
        if (updates.containsKey("city")) user.setCity((String) updates.get("city"));
        if (updates.containsKey("bio")) user.setBio((String) updates.get("bio"));
        if (updates.containsKey("profileImage")) user.setProfileImage((String) updates.get("profileImage"));
        if (updates.containsKey("profileImagePath")) user.setProfileImage((String) updates.get("profileImagePath"));

        if (updates.containsKey("languageIds")) {
            var idsObj = updates.get("languageIds");
            var ids = toLongList(idsObj);
            var languages = languageRepository.findAllById(ids);
            if (!ids.isEmpty() && languages.size() != ids.size()) {
                throw new NotFoundException("One or more languages not found");
            }
            user.setLanguages(new java.util.HashSet<>(languages));
        }

        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    private List<Long> toLongList(Object value) {
        if (value instanceof List<?> raw) {
            return raw.stream()
                    .filter(java.util.Objects::nonNull)
                    .map(v -> {
                        if (v instanceof Number n) return n.longValue();
                        if (v instanceof String s) return Long.parseLong(s);
                        throw new IllegalArgumentException("Unsupported id type");
                    })
                    .toList();
        }
        return List.of();
    }
}
