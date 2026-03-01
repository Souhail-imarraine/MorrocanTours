package com.moroccantour.mapper;

import com.moroccantour.dto.request.CreateCategoryRequest;
import com.moroccantour.dto.response.CategoryResponse;
import com.moroccantour.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = MapperConfig.class)
public interface CategoryMapper {
    CategoryResponse toResponse(Category category);

    @Mapping(target = "id", ignore = true)
    Category toEntity(CreateCategoryRequest request);

    void updateEntity(CreateCategoryRequest request, @MappingTarget Category category);
}
