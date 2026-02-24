package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentCategoryRepository extends JpaRepository<EquipmentCategory, Integer> {
    List<EquipmentCategory> findByIsActive(Boolean isActive);
}
