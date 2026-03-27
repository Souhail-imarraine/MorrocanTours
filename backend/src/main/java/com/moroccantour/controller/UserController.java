package com.moroccantour.controller;

import com.moroccantour.dto.request.UpdateUserStatusRequest;
import com.moroccantour.dto.response.PageResponse;
import com.moroccantour.dto.response.UserResponse;
import com.moroccantour.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> profile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody java.util.Map<String, Object> updates) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), updates));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<UserResponse>> all(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(userService.getAll(page, size));
    }

    @PutMapping("/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateStatus(@PathVariable Long id,
            @RequestParam boolean active) {
        return ResponseEntity.ok(userService.updateStatus(id, new UpdateUserStatusRequest(active)));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/guide-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> pendingGuides() {
        return ResponseEntity.ok(userService.getPendingGuides());
    }

    @PutMapping("/admin/guide-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveGuide(id));
    }

    @DeleteMapping("/admin/guide-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reject(@PathVariable Long id) {
        userService.rejectGuide(id);
        return ResponseEntity.noContent().build();
    }
}
