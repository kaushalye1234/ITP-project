package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobCategoryRepository extends JpaRepository<JobCategory, Integer> {
    List<JobCategory> findByIsActive(Boolean isActive);
}
