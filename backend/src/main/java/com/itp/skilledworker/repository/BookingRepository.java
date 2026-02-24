package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.Booking;
import com.itp.skilledworker.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByWorker_WorkerId(Integer workerId);

    List<Booking> findByCustomer_CustomerId(Integer customerId);

    List<Booking> findByWorker_WorkerIdAndBookingStatus(Integer workerId, BookingStatus status);

    List<Booking> findByCustomer_CustomerIdAndBookingStatus(Integer customerId, BookingStatus status);
}
