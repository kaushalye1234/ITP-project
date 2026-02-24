package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.SupplierProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SupplierProfileRepository extends JpaRepository<SupplierProfile, Integer> {
    Optional<SupplierProfile> findByUser_UserId(Integer userId);
}
