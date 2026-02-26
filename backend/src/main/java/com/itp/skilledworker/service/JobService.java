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
    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;

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

    @Transactional
    public JobApplication applyToJob(Integer jobId, Integer workerUserId, String coverNote, BigDecimal proposedPrice) {
        Job job = getJobById(jobId);
        if (job.getJobStatus() != Job.JobStatus.active) {
            throw new RuntimeException("Can only apply to active jobs");
        }
        if (jobApplicationRepository.existsByJob_JobIdAndWorkerUser_UserId(jobId, workerUserId)) {
            throw new RuntimeException("You have already applied to this job");
        }
        User worker = userRepository.findById(workerUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setWorkerUser(worker);
        application.setCoverNote(coverNote);
        application.setProposedPrice(proposedPrice);
        application.setStatus(JobApplication.ApplicationStatus.pending);
        return jobApplicationRepository.save(application);
    }

    public List<JobApplication> getJobApplications(Integer jobId, Integer customerUserId) {
        Job job = getJobById(jobId);
        if (!job.getCustomer().getUser().getUserId().equals(customerUserId)) {
            throw new RuntimeException("Unauthorized: You don't own this job");
        }
        return jobApplicationRepository.findByJob_JobId(jobId);
    }

    @Transactional
    public JobApplication updateApplicationStatus(Integer jobId, Long applicationId,
            Integer customerUserId, String status) {
        Job job = getJobById(jobId);
        if (!job.getCustomer().getUser().getUserId().equals(customerUserId)) {
            throw new RuntimeException("Unauthorized: You don't own this job");
        }
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        if (!application.getJob().getJobId().equals(jobId)) {
            throw new RuntimeException("Application does not belong to this job");
        }
        application.setStatus(JobApplication.ApplicationStatus.valueOf(status.toLowerCase()));

        if ("accepted".equalsIgnoreCase(status)) {
            List<JobApplication> others = jobApplicationRepository.findByJob_JobId(jobId);
            for (JobApplication other : others) {
                if (!other.getApplicationId().equals(applicationId)
                        && other.getStatus() == JobApplication.ApplicationStatus.pending) {
                    other.setStatus(JobApplication.ApplicationStatus.rejected);
                    jobApplicationRepository.save(other);
                }
            }
        }
        return jobApplicationRepository.save(application);
    }

    public List<JobApplication> getWorkerApplications(Integer workerUserId) {
        return jobApplicationRepository.findByWorkerUser_UserId(workerUserId);
    }

    @Transactional
    public Job updateJobStatus(Integer jobId, Integer customerUserId, String status) {
        Job job = getJobById(jobId);
        if (!job.getCustomer().getUser().getUserId().equals(customerUserId)) {
            throw new RuntimeException("Unauthorized: You don't own this job");
        }
        job.setJobStatus(Job.JobStatus.valueOf(status.toLowerCase()));
        return jobRepository.save(job);
    }
}
