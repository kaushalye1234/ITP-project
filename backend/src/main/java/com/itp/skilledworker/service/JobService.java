package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobCategoryRepository categoryRepository;
    private final CustomerProfileRepository customerProfileRepository;

    @Transactional
    public Job createJob(Integer customerUserId, Integer categoryId, String title, String description,
            String city, String district, String urgency,
            BigDecimal budgetMin, BigDecimal budgetMax, String preferredDate) {
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found. Register as a customer first."));
        JobCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Job job = new Job();
        job.setCustomer(customer);
        job.setCategory(category);
        job.setJobTitle(title);
        job.setJobDescription(description);
        job.setCity(city);
        job.setDistrict(district);
        job.setUrgencyLevel(Job.UrgencyLevel.valueOf(urgency.toLowerCase()));
        job.setBudgetMin(budgetMin);
        job.setBudgetMax(budgetMax);
        job.setJobStatus(Job.JobStatus.active);
        if (preferredDate != null && !preferredDate.isEmpty()) {
            job.setPreferredStartDate(LocalDate.parse(preferredDate));
        }
        return jobRepository.save(job);
    }

    public List<Job> getAllActiveJobs(String district, Integer categoryId) {
        return jobRepository.findActiveJobsWithFilters(district, categoryId);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Job getJobById(Integer id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    @Transactional
    public Job updateJob(Integer jobId, Integer customerUserId, String title, String description,
            BigDecimal budgetMin, BigDecimal budgetMax, String urgency) {
        Job job = getJobById(jobId);
        // Verify ownership
        if (!job.getCustomer().getUser().getUserId().equals(customerUserId)) {
            throw new RuntimeException("Unauthorized: You don't own this job");
        }
        if (title != null)
            job.setJobTitle(title);
        if (description != null)
            job.setJobDescription(description);
        if (budgetMin != null)
            job.setBudgetMin(budgetMin);
        if (budgetMax != null)
            job.setBudgetMax(budgetMax);
        if (urgency != null)
            job.setUrgencyLevel(Job.UrgencyLevel.valueOf(urgency.toLowerCase()));
        return jobRepository.save(job);
    }

    @Transactional
    public void deleteJob(Integer jobId, Integer customerUserId) {
        Job job = getJobById(jobId);
        if (!job.getCustomer().getUser().getUserId().equals(customerUserId)) {
            throw new RuntimeException("Unauthorized: You don't own this job");
        }
        jobRepository.delete(job);
    }

    public List<JobCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Job> getMyJobs(Integer customerUserId) {
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        return jobRepository.findByCustomer_CustomerId(customer.getCustomerId());
    }
}
