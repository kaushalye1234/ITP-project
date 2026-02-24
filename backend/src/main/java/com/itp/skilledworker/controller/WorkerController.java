package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.WorkerDtos.WorkerProfileUpdateRequest;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkerProfile>>> getAllWorkers(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Boolean available) {
        return ResponseEntity.ok(ApiResponse.ok("Workers", userService.getAllWorkers(district)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerProfile>> getWorker(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Worker profile", userService.getWorkerById(id)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<WorkerProfile>> getMyProfile(Authentication auth) {
        try {
            WorkerProfile profile = userService.getWorkerByEmail(auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Worker profile", profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<WorkerProfile>> updateMyProfile(
            @Valid @RequestBody WorkerProfileUpdateRequest body,
            Authentication auth) {
        try {
            WorkerProfile profile = userService.updateWorkerProfile(auth.getName(), body);
            return ResponseEntity.ok(ApiResponse.ok("Profile updated", profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<?>> deleteMyAccount(Authentication auth) {
        try {
            userService.deactivateUser(auth.getName());
            return ResponseEntity.ok(ApiResponse.ok("Account deactivated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Admin: Get all users
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok("All users", userService.getAllUsers()));
    }

    // Admin: Toggle user active status
    @PatchMapping("/admin/users/{userId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleUser(@PathVariable Integer userId) {
        try {
            User user = userService.toggleUserActive(userId);
            return ResponseEntity.ok(ApiResponse.ok("User status updated", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
