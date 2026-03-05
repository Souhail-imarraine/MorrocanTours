package com.moroccantour.service;

import com.moroccantour.dto.request.CreateCategoryRequest;
import com.moroccantour.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> findAll();
    CategoryResponse create(CreateCategoryRequest request);
    CategoryResponse update(Long id, CreateCategoryRequest request);
    void delete(Long id);
}
