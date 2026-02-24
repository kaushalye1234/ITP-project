package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentInventoryRepository inventoryRepository;
    private final EquipmentBookingRepository bookingRepository;
    private final EquipmentCategoryRepository categoryRepository;
    private final SupplierProfileRepository supplierRepository;
    private final CustomerProfileRepository customerProfileRepository;

    @Transactional
    public EquipmentInventory addEquipment(Integer supplierUserId, Integer categoryId,
            String name, String description, String condition,
            BigDecimal pricePerDay, BigDecimal deposit, Integer qty) {
        SupplierProfile supplier = supplierRepository.findByUser_UserId(supplierUserId)
                .orElseThrow(() -> new RuntimeException("Supplier profile not found"));
        EquipmentCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        EquipmentInventory equipment = new EquipmentInventory();
        equipment.setSupplier(supplier);
        equipment.setEquipmentCategory(category);
        equipment.setEquipmentName(name);
        equipment.setEquipmentDescription(description);
        equipment.setEquipmentCondition(EquipmentInventory.EquipmentCondition.valueOf(condition.toLowerCase()));
        equipment.setRentalPricePerDay(pricePerDay);
        equipment.setDepositAmount(deposit);
        equipment.setQuantityTotal(qty);
        equipment.setQuantityAvailable(qty);
        equipment.setIsAvailable(true);
        return inventoryRepository.save(equipment);
    }

    public List<EquipmentInventory> getAvailableEquipment() {
        return inventoryRepository.findByIsAvailableAndQuantityAvailableGreaterThan(true, 0);
    }

    public List<EquipmentInventory> getAllEquipment() {
        return inventoryRepository.findAll();
    }

    public EquipmentInventory getEquipmentById(Integer id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));
    }

    @Transactional
    public EquipmentInventory updateEquipment(Integer equipmentId, String name, String description,
            BigDecimal pricePerDay) {
        EquipmentInventory eq = getEquipmentById(equipmentId);
        if (name != null)
            eq.setEquipmentName(name);
        if (description != null)
            eq.setEquipmentDescription(description);
        if (pricePerDay != null)
            eq.setRentalPricePerDay(pricePerDay);
        return inventoryRepository.save(eq);
    }

    @Transactional
    public void deleteEquipment(Integer equipmentId) {
        inventoryRepository.deleteById(equipmentId);
    }

    @Transactional
    public EquipmentBooking bookEquipment(Integer equipmentId, Integer customerUserId,
            String startDate, String endDate, String notes) {
        EquipmentInventory equipment = getEquipmentById(equipmentId);
        if (equipment.getQuantityAvailable() < 1) {
            throw new RuntimeException("Equipment not available");
        }
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        long days = ChronoUnit.DAYS.between(start, end);
        if (days <= 0)
            throw new RuntimeException("End date must be after start date");

        BigDecimal baseCost = equipment.getRentalPricePerDay().multiply(BigDecimal.valueOf(days));

        EquipmentBooking booking = new EquipmentBooking();
        booking.setEquipment(equipment);
        booking.setCustomer(customer);
        booking.setSupplier(equipment.getSupplier());
        booking.setRentalStartDate(start);
        booking.setRentalEndDate(end);
        booking.setDailyRate(equipment.getRentalPricePerDay());
        booking.setTotalDays((int) days);
        booking.setBaseRentalCost(baseCost);
        booking.setTotalCost(baseCost);
        booking.setDepositAmount(equipment.getDepositAmount());
        booking.setNotes(notes);
        booking.setBookingStatus(EquipmentBooking.BookingStatus.reserved);
        return bookingRepository.save(booking);
    }

    @Transactional
    public EquipmentBooking returnEquipment(Integer bookingId) {
        EquipmentBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Equipment booking not found"));

        booking.setActualReturnDate(LocalDate.now());
        booking.setBookingStatus(EquipmentBooking.BookingStatus.returned);
        return bookingRepository.save(booking);
    }

    public Map<String, Object> calculateLateFee(Integer bookingId) {
        EquipmentBooking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Equipment booking not found"));

        // Delegate late fee calculation to the database stored procedure
        bookingRepository.callCalculateLateFee(bookingId);

        // Reload booking to get updated late fee and total cost
        EquipmentBooking updated = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Equipment booking not found"));

        if (updated.getLateFee() == null || updated.getLateFee().compareTo(BigDecimal.ZERO) == 0) {
            return Map.of(
                    "bookingId", bookingId,
                    "daysOverdue", 0,
                    "dailyLateFeeRate", BigDecimal.ZERO,
                    "totalLateFee", BigDecimal.ZERO,
                    "rentalEndDate", updated.getRentalEndDate().toString(),
                    "message", "Not overdue");
        }

        long daysOverdue = ChronoUnit.DAYS.between(updated.getRentalEndDate(), LocalDate.now());
        BigDecimal dailyLateFeeRate = daysOverdue > 0
                ? updated.getLateFee().divide(BigDecimal.valueOf(daysOverdue))
                : BigDecimal.ZERO;

        return Map.of(
                "bookingId", bookingId,
                "daysOverdue", daysOverdue,
                "dailyLateFeeRate", dailyLateFeeRate,
                "totalLateFee", updated.getLateFee(),
                "rentalEndDate", updated.getRentalEndDate().toString());
    }

    public List<EquipmentBooking> getCustomerBookings(Integer customerUserId) {
        CustomerProfile customer = customerProfileRepository.findByUser_UserId(customerUserId)
                .orElseThrow(() -> new RuntimeException("Customer profile not found"));
        return bookingRepository.findByCustomer_CustomerId(customer.getCustomerId());
    }

    public List<EquipmentCategory> getCategories() {
        return categoryRepository.findAll();
    }
}
