package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query(value = """
            SELECT b.* FROM bookings b
            JOIN available_slot a ON a.booking_id = b.id
            JOIN time_slot ts ON ts.id = a.time_slot_id
            WHERE b.status = 'CONFIRMED'
            AND (a.date > :today
                OR (a.date = :today
                    AND ts.start_time >= :cutOffTime))
            GROUP BY b.id
            ORDER BY MIN(a.date) ASC, MIN(ts.start_time) ASC
            """, nativeQuery = true)
    List<Booking> getUpcomingBookingsTillNow(
            @Param("today") LocalDate today,
            @Param("cutOffTime") LocalTime cutOffTime);

}
