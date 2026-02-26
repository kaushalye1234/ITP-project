package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.WorkerAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WorkerAvailabilityRepository extends JpaRepository<WorkerAvailability, Long> {
    List<WorkerAvailability> findByWorker_WorkerId(Integer workerId);

    List<WorkerAvailability> findByWorker_WorkerIdAndAvailableDateGreaterThanEqual(Integer workerId, LocalDate date);
}
