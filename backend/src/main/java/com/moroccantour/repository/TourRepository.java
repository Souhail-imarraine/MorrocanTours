package com.moroccantour.repository;

import com.moroccantour.entity.Tour;
import com.moroccantour.entity.enums.TourStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TourRepository extends JpaRepository<Tour, Long> {
    Page<Tour> findByCityContainingIgnoreCaseAndCategoryId(String city, Long categoryId, Pageable pageable);

    Page<Tour> findByCityContainingIgnoreCase(String city, Pageable pageable);

    Page<Tour> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Tour> findByGuideId(Long guideId, Pageable pageable);

    List<Tour> findByGuideId(Long guideId);

    long countByStatus(TourStatus status);

    boolean existsByCategoryId(Long categoryId);
}
