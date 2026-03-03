package com.moroccantour.mapper;

import com.moroccantour.dto.request.CreateLanguageRequest;
import com.moroccantour.dto.response.LanguageResponse;
import com.moroccantour.entity.Language;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(config = MapperConfig.class)
public interface LanguageMapper {
    LanguageResponse toResponse(Language language);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tours", ignore = true)
    @Mapping(target = "users", ignore = true)
    Language toEntity(CreateLanguageRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tours", ignore = true)
    @Mapping(target = "users", ignore = true)
    void updateEntity(CreateLanguageRequest request, @MappingTarget Language language);
}
