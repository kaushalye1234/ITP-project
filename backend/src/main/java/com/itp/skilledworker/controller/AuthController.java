package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.repository.UserRepository;
import com.itp.skilledworker.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication auth) {
        try {
            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(ApiResponse.ok("Current user", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest req) {
        try {
            var result = authService.register(req.email, req.password, req.role, req.firstName, req.lastName,
                    req.phone);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Registration successful", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest req) {
        try {
            var result = authService.login(req.email, req.password);
            return ResponseEntity.ok(ApiResponse.ok("Login successful", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<Map<String, Object>>> googleLogin(@Valid @RequestBody GoogleLoginRequest req) {
        try {
            var result = authService.loginWithGoogle(req.idToken);
            return ResponseEntity.ok(ApiResponse.ok("Login successful", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
            }
            String message = authService.forgotPassword(email);
            return ResponseEntity.ok(ApiResponse.ok("Reset instructions sent", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");
            if (token == null || token.isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Reset token is required"));
            }
            if (newPassword == null || newPassword.isBlank()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("New password is required"));
            }
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(ApiResponse.ok("Password reset successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @Data
    static class RegisterRequest {
        @Email
        @NotBlank
        String email;
        @NotBlank
        @Size(min = 6)
        String password;
        @NotBlank
        String role;
        @NotBlank
        String firstName;
        @NotBlank
        String lastName;
        String phone;
    }

    @Data
    static class LoginRequest {
        @Email
        @NotBlank
        String email;
        @NotBlank
        String password;
    }

    @Data
    static class GoogleLoginRequest {
        @NotBlank
        String idToken;
    }
}
