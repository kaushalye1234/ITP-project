package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.Booking;
import com.itp.skilledworker.entity.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
       List<Booking> findByWorker_WorkerId(Integer workerId);

       List<Booking> findByCustomer_CustomerId(Integer customerId);

       List<Booking> findByWorker_WorkerIdAndBookingStatus(Integer workerId, BookingStatus status);

       List<Booking> findByCustomer_CustomerIdAndBookingStatus(Integer customerId, BookingStatus status);

       @Query("SELECT b FROM Booking b WHERE b.worker.workerId = :workerId " +
                     "AND b.scheduledDate = :date " +
                     "AND b.bookingStatus IN (:statuses)")
       List<Booking> findConflictingBookings(
                     @Param("workerId") Integer workerId,
                     @Param("date") LocalDate date,
                     @Param("statuses") List<BookingStatus> statuses);

       @Query("SELECT b FROM Booking b WHERE b.worker.workerId = :workerId " +
                     "AND b.bookingStatus IN (:statuses)")
       List<Booking> findConflictingBookings(
                     @Param("workerId") Integer workerId,
                     @Param("statuses") List<BookingStatus> statuses);
}
