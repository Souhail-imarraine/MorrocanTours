package com.moroccantour.service.impl;

import com.moroccantour.dto.request.CreateTourRequest;
import com.moroccantour.dto.request.UpdateTourRequest;
import com.moroccantour.dto.response.PageResponse;
import com.moroccantour.dto.response.TourImageResponse;
import com.moroccantour.dto.response.TourResponse;
import com.moroccantour.entity.Category;
import com.moroccantour.entity.Tour;
import com.moroccantour.entity.TourImage;
import com.moroccantour.entity.User;
import com.moroccantour.entity.enums.Role;
import com.moroccantour.entity.enums.TourStatus;
import com.moroccantour.exception.ForbiddenException;
import com.moroccantour.exception.NotFoundException;
import com.moroccantour.mapper.TourImageMapper;
import com.moroccantour.mapper.TourMapper;
import com.moroccantour.repository.CategoryRepository;
import com.moroccantour.repository.TourImageRepository;
import com.moroccantour.repository.TourRepository;
import com.moroccantour.repository.UserRepository;
import com.moroccantour.security.UserPrincipal;
import com.moroccantour.service.ImageStorageService;
import com.moroccantour.service.TourService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final CategoryRepository categoryRepository;
    private final TourImageRepository tourImageRepository;
    private final UserRepository userRepository;
    private final TourMapper tourMapper;
    private final TourImageMapper tourImageMapper;
    private final ImageStorageService imageStorageService;

    @Override
    public PageResponse<TourResponse> getAll(int page, int size, String city, Long categoryId) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Tour> result;
        if (city != null && categoryId != null) {
            result = tourRepository.findByCityContainingIgnoreCaseAndCategoryId(city, categoryId, pageable);
        } else if (city != null) {
            result = tourRepository.findByCityContainingIgnoreCase(city, pageable);
        } else if (categoryId != null) {
            result = tourRepository.findByCategoryId(categoryId, pageable);
        } else {
            result = tourRepository.findAll(pageable);
        }
        var mapped = result.map(tourMapper::toResponse);
        return new PageResponse<>(
                mapped.getContent(),
                mapped.getTotalElements(),
                mapped.getTotalPages(),
                mapped.getSize(),
                mapped.getNumber());
    }

    @Override
    public TourResponse getById(Long id) {
        Tour tour = tourRepository.findById(id).orElseThrow(() -> new NotFoundException("Tour not found"));
        return tourMapper.toResponse(tour);
    }

    @Override
    public TourResponse create(CreateTourRequest request) {
        User authUser = currentUser();
        User guide = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new NotFoundException("Guide not found"));
        ensureGuide(guide);
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        Tour tour = tourMapper.toEntity(request);
        tour.setCategory(category);
        tour.setGuide(guide);
        tour.setStatus(TourStatus.DRAFT);
        tourRepository.save(tour);
        return tourMapper.toResponse(tour);
    }

    @Override
    public TourResponse update(Long id, UpdateTourRequest request) {
        Tour tour = tourRepository.findById(id).orElseThrow(() -> new NotFoundException("Tour not found"));
        ensureGuide(tour.getGuide());

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));
        tourMapper.updateEntity(request, tour);
        tour.setCategory(category);
        tourRepository.save(tour);
        return tourMapper.toResponse(tour);
    }

    @Override
    public void delete(Long id) {
        Tour tour = tourRepository.findById(id).orElseThrow(() -> new NotFoundException("Tour not found"));
        ensureGuide(tour.getGuide());
        tourRepository.delete(tour);
    }

    @Override
    public TourResponse publish(Long id) {
        Tour tour = tourRepository.findById(id).orElseThrow(() -> new NotFoundException("Tour not found"));
        ensureGuide(tour.getGuide());
        tour.setStatus(TourStatus.PUBLISHED);
        tourRepository.save(tour);
        return tourMapper.toResponse(tour);
    }

    @Override
    public List<TourResponse> getMyTours(String email) {
        User guide = userRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
        ensureGuide(guide);
        return tourRepository.findByGuideId(guide.getId()).stream()
                .map(tourMapper::toResponse)
                .toList();
    }

    @Override
    public TourImageResponse uploadImage(Long tourId, MultipartFile file) {
        Tour tour = tourRepository.findById(tourId).orElseThrow(() -> new NotFoundException("Tour not found"));
        ensureGuide(tour.getGuide());
        String stored = imageStorageService.store(file);
        TourImage image = TourImage.builder()
                .imageUrl(stored)
                .tour(tour)
                .displayOrder(tour.getImages().size())
                .build();
        tourImageRepository.save(image);
        tour.getImages().add(image);
        return tourImageMapper.toResponse(image);
    }

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return principal.user();
        }
        throw new ForbiddenException("User not authenticated");
    }

    private void ensureGuide(User user) {
        if (user == null || user.getRole() != Role.GUIDE) {
            throw new ForbiddenException("Guide role required");
        }
    }
}
