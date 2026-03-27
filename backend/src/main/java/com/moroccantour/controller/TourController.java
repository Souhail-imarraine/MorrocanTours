package com.moroccantour.controller;

import com.moroccantour.dto.request.CreateTourRequest;
import com.moroccantour.dto.request.UpdateTourRequest;
import com.moroccantour.dto.response.PageResponse;
import com.moroccantour.dto.response.TourResponse;
import com.moroccantour.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @GetMapping
    public ResponseEntity<PageResponse<TourResponse>> all(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(tourService.getAll(page, size, city, categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.getById(id));
    }

    @PostMapping("/guide")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<TourResponse> create(@RequestBody @Valid CreateTourRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tourService.create(request));
    }

    @PutMapping("/guide/{id}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<TourResponse> update(@PathVariable Long id, @RequestBody @Valid UpdateTourRequest request) {
        return ResponseEntity.ok(tourService.update(id, request));
    }

    @DeleteMapping("/guide/{id}")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tourService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/guide/{id}/publish")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<TourResponse> publish(@PathVariable Long id) {
        return ResponseEntity.ok(tourService.publish(id));
    }

    @GetMapping("/guide/my-tours")
    @PreAuthorize("hasRole('GUIDE')")
    public ResponseEntity<List<TourResponse>> myTours(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tourService.getMyTours(userDetails.getUsername()));
    }
}
