package com.moroccantour.mapper;

import com.moroccantour.dto.response.TourImageResponse;
import com.moroccantour.entity.TourImage;
import org.mapstruct.Mapper;

@Mapper(config = MapperConfig.class)
public interface TourImageMapper {
    TourImageResponse toResponse(TourImage image);
}
