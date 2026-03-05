package com.moroccantour.service;

import com.moroccantour.dto.request.CreateLanguageRequest;
import com.moroccantour.dto.response.LanguageResponse;

import java.util.List;

public interface LanguageService {
    List<LanguageResponse> findAll();
    LanguageResponse create(CreateLanguageRequest request);
    LanguageResponse update(Long id, CreateLanguageRequest request);
    void delete(Long id);
}
