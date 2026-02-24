package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.EquipmentBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, Integer> {
    List<EquipmentBooking> findByCustomer_CustomerId(Integer customerId);

    List<EquipmentBooking> findBySupplier_SupplierId(Integer supplierId);

    List<EquipmentBooking> findByBookingStatus(EquipmentBooking.BookingStatus status);

    @Query(value = "CALL calculate_late_fee(:bookingId)", nativeQuery = true)
    void callCalculateLateFee(@Param("bookingId") Integer bookingId);
}

