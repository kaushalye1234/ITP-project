package com.itp.skilledworker.service;

import com.itp.skilledworker.dto.WorkerDtos.WorkerProfileUpdateRequest;
import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;

    public List<WorkerProfile> getAllWorkers(String district) {
        if (district != null && !district.isEmpty()) {
            return workerProfileRepository.findByDistrict(district);
        }
        return workerProfileRepository.findAll();
    }

    public WorkerProfile getWorkerById(Integer workerId) {
        return workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
    }

    public WorkerProfile getWorkerByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return workerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));
    }

    @Transactional
    public WorkerProfile updateWorkerProfile(String email, WorkerProfileUpdateRequest updated) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        WorkerProfile profile = workerProfileRepository.findByUser_UserId(user.getUserId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        if (updated.getFirstName() != null)
            profile.setFirstName(updated.getFirstName());
        if (updated.getLastName() != null)
            profile.setLastName(updated.getLastName());
        if (updated.getBio() != null)
            profile.setBio(updated.getBio());
        if (updated.getCity() != null)
            profile.setCity(updated.getCity());
        if (updated.getDistrict() != null)
            profile.setDistrict(updated.getDistrict());
        if (updated.getHourlyRateMin() != null)
            profile.setHourlyRateMin(updated.getHourlyRateMin());
        if (updated.getHourlyRateMax() != null)
            profile.setHourlyRateMax(updated.getHourlyRateMax());

        return workerProfileRepository.save(profile);
    }

    @Transactional
    public void deactivateUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User toggleUserActive(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(!user.getIsActive());
        return userRepository.save(user);
    }
}
