package com.moroccantour.service.impl;

import com.moroccantour.dto.request.CreateCategoryRequest;
import com.moroccantour.dto.response.CategoryResponse;
import com.moroccantour.entity.Category;
import com.moroccantour.exception.ConflictException;
import com.moroccantour.exception.NotFoundException;
import com.moroccantour.mapper.CategoryMapper;
import com.moroccantour.repository.CategoryRepository;
import com.moroccantour.repository.TourRepository;
import com.moroccantour.service.CategoryService;
import com.moroccantour.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TourRepository tourRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll().stream().map(categoryMapper::toResponse).toList();
    }

    @Override
    public CategoryResponse create(CreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.name())) {
            throw new ConflictException("Category already exists");
        }
        Category category = categoryMapper.toEntity(request);
        categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse update(Long id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
        categoryMapper.updateEntity(request, category);
        categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    @Override
    public void delete(Long id) {
        if (tourRepository.existsByCategoryId(id)) {
            throw new BadRequestException("Category cannot be deleted because it is being used by one or more tours.");
        }
        categoryRepository.deleteById(id);
    }
}
