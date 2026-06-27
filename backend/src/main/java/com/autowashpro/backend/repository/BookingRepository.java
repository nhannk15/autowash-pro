package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerId(Long id);

    /**
     * Complex Queries
     * 
     * @param today
     * @param cutOffTime
     * @return
     */

    // @Query(value = """
    // SELECT b.* FROM bookings b
    // JOIN available_slot a ON a.booking_id = b.id
    // JOIN time_slot ts ON ts.id = a.time_slot_id
    // WHERE b.status = 'CONFIRMED'
    // AND (a.date > :today
    // OR (a.date = :today
    // AND ts.start_time >= :cutOffTime))
    // GROUP BY b.id
    // ORDER BY MIN(a.date) ASC, MIN(ts.start_time) ASC
    // """, nativeQuery = true)
    @Query(value = """
            SELECT b.* FROM bookings b
            JOIN available_slot a ON a.booking_id = b.id
            JOIN time_slot ts ON ts.id = a.time_slot_id
            JOIN customers c ON c.id = b.customer_id
            JOIN membership_tiers mt ON mt.id = c.tier_id
            WHERE b.status = 'CONFIRMED'
            AND (a.date > :today
                OR (a.date = :today
                    AND ts.start_time >= :cutOffTime))
            GROUP BY b.id, b.booking_code, b.customer_id, b.vehicle_id, b.status,
                     b.notes, b.promotion_id, b.created_at, b.updated_at,
                     b.cancelled_at, b.cancel_reason,
                     mt.tier_level
            ORDER BY mt.tier_level DESC, MIN(a.date) ASC, MIN(ts.start_time) ASC
            """, nativeQuery = true)
    List<Booking> getUpcomingBookingsTillNow(
            @Param("today") LocalDate today,
            @Param("cutOffTime") LocalTime cutOffTime);

    @Query("""
            SELECT booking FROM Booking booking
            WHERE booking.bookingCode = :bookingCode
            AND booking.status = com.autowashpro.backend.model.enums.BookingStatus.CONFIRMED
            """)
    Optional<Booking> findByBookingCode(String bookingCode);

    @Query("""
            SELECT booking FROM Booking booking
            JOIN booking.availableSlots availableSlot
            WHERE availableSlot.slotDate = :today
            """)
    List<Booking> findTodayBookings(@Param("today") LocalDate today);

    @Query("""
            SELECT booking FROM Booking booking
            JOIN booking.availableSlots availableSlot
            WHERE booking.customer.id = :customerId
            AND availableSlot.slotDate >= :today
            AND booking.status = com.autowashpro.backend.model.enums.BookingStatus.CONFIRMED
            ORDER BY availableSlot.slotDate, availableSlot.timeSlot.startTime
            """)
    List<Booking> findCustomerUpcomingBookings(@Param("customerId") Long customerId,
            @Param("today") LocalDate today);

    @Query("SELECT b FROM Booking b JOIN FETCH b.bookingDetails WHERE b.id = :id")
    Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    @Query("""
            SELECT booking FROM Booking booking
            WHERE booking.status = :status
            AND EXISTS (
                SELECT 1 FROM AvailableSlot availableSlot
                JOIN availableSlot.booking b
                WHERE b = booking
                AND availableSlot.slotDate >= :startDate
                AND availableSlot.slotDate <= :endDate
            )
            """)
    List<Booking> findByStatusAccordingToDate(@Param("status") BookingStatus status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT booking FROM Booking booking
            WHERE EXISTS (
                SELECT 1 FROM AvailableSlot availableSlot
                JOIN availableSlot.booking b
                WHERE b = booking
                AND availableSlot.slotDate >= :startDate
                AND availableSlot.slotDate <= :endDate
            )
            """)
    List<Booking> findBookingsAccordingToDate(@Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
            SELECT 
                booking
            FROM Booking booking
            JOIN booking.billing billing
            JOIN booking.customer customer
            WHERE 
                customer.id = :customerId
                AND booking.status = com.autowashpro.backend.model.enums.BookingStatus.PENDING
                AND billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PENDING
            """)
    List<Booking> getPendingDepositBookings(@Param("customerId") Long customerId);
}
