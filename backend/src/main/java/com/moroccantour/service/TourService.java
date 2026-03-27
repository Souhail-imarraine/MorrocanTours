package com.moroccantour.service;

import com.moroccantour.dto.request.CreateTourRequest;
import com.moroccantour.dto.request.UpdateTourRequest;
import com.moroccantour.dto.response.PageResponse;
import com.moroccantour.dto.response.TourImageResponse;
import com.moroccantour.dto.response.TourResponse;
import org.springframework.web.multipart.MultipartFile;

public interface TourService {
    PageResponse<TourResponse> getAll(int page, int size, String city, Long categoryId);

    TourResponse getById(Long id);

    TourResponse create(CreateTourRequest request);

    TourResponse update(Long id, UpdateTourRequest request);

    void delete(Long id);

    TourResponse publish(Long id);

    java.util.List<TourResponse> getMyTours(String email);

    TourImageResponse uploadImage(Long tourId, MultipartFile file);
}
