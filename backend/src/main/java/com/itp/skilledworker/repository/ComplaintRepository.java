package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {
    List<Complaint> findByComplainant_UserId(Integer userId);

    List<Complaint> findByComplaintStatus(Complaint.ComplaintStatus status);
}
