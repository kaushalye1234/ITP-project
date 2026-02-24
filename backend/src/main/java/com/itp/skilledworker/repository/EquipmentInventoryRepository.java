package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.EquipmentInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentInventoryRepository extends JpaRepository<EquipmentInventory, Integer> {
    List<EquipmentInventory> findByIsAvailableAndQuantityAvailableGreaterThan(Boolean isAvailable, Integer qty);

    List<EquipmentInventory> findByEquipmentCategory_EquipmentCategoryId(Integer categoryId);

    List<EquipmentInventory> findBySupplier_SupplierId(Integer supplierId);
}
