package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.PasswordRecovery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordRecoveryRepository extends JpaRepository<PasswordRecovery, Integer> {
    Optional<PasswordRecovery> findByRecoveryToken(String token);

    void deleteByUser_UserId(Integer userId);
}
