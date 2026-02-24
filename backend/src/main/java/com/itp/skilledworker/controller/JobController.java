package com.itp.skilledworker.controller;

import com.itp.skilledworker.dto.ApiResponse;
import com.itp.skilledworker.dto.JobDtos.JobCreateRequest;
import com.itp.skilledworker.dto.JobDtos.JobUpdateRequest;
import com.itp.skilledworker.entity.Job;
import com.itp.skilledworker.entity.JobCategory;
import com.itp.skilledworker.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.itp.skilledworker.repository.UserRepository;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Job>>> getAllJobs(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer categoryId) {
        List<Job> jobs = jobService.getAllActiveJobs(district, categoryId);
        return ResponseEntity.ok(ApiResponse.ok("Jobs fetched", jobs));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Job>>> getAllJobsAdmin() {
        return ResponseEntity.ok(ApiResponse.ok("All jobs", jobService.getAllJobs()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> getJob(@PathVariable Integer id) {
        try {
            Job job = jobService.getJobById(id);
            return ResponseEntity.ok(ApiResponse.ok("Job fetched", job));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Job>>> getMyJobs(Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            return ResponseEntity.ok(ApiResponse.ok("My jobs", jobService.getMyJobs(userId)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Job>> createJob(@Valid @RequestBody JobCreateRequest req, Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Job job = jobService.createJob(
                    userId,
                    req.getCategoryId(),
                    req.getJobTitle(),
                    req.getJobDescription(),
                    req.getCity(),
                    req.getDistrict(),
                    req.getUrgencyLevel(),
                    req.getBudgetMin(),
                    req.getBudgetMax(),
                    req.getPreferredStartDate());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Job created", job));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Job>> updateJob(@PathVariable Integer id,
            @Valid @RequestBody JobUpdateRequest req,
            Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            Job job = jobService.updateJob(id, userId,
                    req.getJobTitle(),
                    req.getJobDescription(),
                    req.getBudgetMin(),
                    req.getBudgetMax(),
                    req.getUrgencyLevel());
            return ResponseEntity.ok(ApiResponse.ok("Job updated", job));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteJob(@PathVariable Integer id, Authentication auth) {
        try {
            Integer userId = getUserId(auth);
            jobService.deleteJob(id, userId);
            return ResponseEntity.ok(ApiResponse.ok("Job deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<JobCategory>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok("Categories", jobService.getAllCategories()));
    }

    private Integer getUserId(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getUserId();
    }
}
