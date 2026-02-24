package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.CustomerProfile;
import com.itp.skilledworker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Integer> {
    Optional<CustomerProfile> findByUser(User user);

    Optional<CustomerProfile> findByUser_UserId(Integer userId);
}
