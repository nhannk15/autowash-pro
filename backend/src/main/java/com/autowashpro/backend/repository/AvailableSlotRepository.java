package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.AvailableSlot;

public interface AvailableSlotRepository extends JpaRepository<AvailableSlot, Long> {

    boolean existsBySlotDate(LocalDate slotDate);

    @Query("""
            SELECT
                s.timeSlot.id,
                s.timeSlot.startTime,
                s.timeSlot.endTime,
                COUNT(s) as totalSlots,
                SUM(CASE WHEN s.booking IS NULL THEN 1 ELSE 0 END) AS availableCount
            FROM AvailableSlot s
            WHERE s.slotDate = :date
            AND s.timeSlot.isActive = true
            AND s.washBay.status = com.autowashpro.backend.model.enums.BayStatus.ACTIVE
            AND s.washBay.category = com.autowashpro.backend.model.enums.BayCategory.NORMAL
            GROUP BY s.timeSlot.id, s.timeSlot.startTime, s.timeSlot.endTime
            ORDER BY s.timeSlot.startTime ASC
            """)
    List<Object[]> findTimeSlotAvailability(@Param("date") LocalDate date);

    @Query("""
            SELECT
                s.timeSlot.id,
                s.timeSlot.startTime,
                s.timeSlot.endTime,
                COUNT(s) as totalSlots,
                SUM(CASE WHEN s.booking IS NULL THEN 1 ELSE 0 END) AS availableCount
            FROM AvailableSlot s
            WHERE s.slotDate = :date
            AND s.timeSlot.isActive = true
            AND s.washBay.status = com.autowashpro.backend.model.enums.BayStatus.ACTIVE
            AND s.washBay.category = com.autowashpro.backend.model.enums.BayCategory.PREMIUM
            GROUP BY s.timeSlot.id, s.timeSlot.startTime, s.timeSlot.endTime
            ORDER BY s.timeSlot.startTime ASC
            """)
    List<Object[]> findTimeSlotAvailabilityForPremiumServices(@Param("date") LocalDate date);

    // @Query(value = """
    // SELECT a.* FROM available_slot a
    // WHERE a.date >= :date
    // AND a.time_slot_id >= :startTimeSlotId
    // AND a.booking_id IS NULL
    // AND a.wash_bay_id = (
    // SELECT a2.wash_bay_id FROM available_slot a2
    // WHERE a2.date = :date
    // AND a2.time_slot_id = :startTimeSlotId
    // AND a2.booking_id IS NULL
    // AND (
    // SELECT COUNT(a3.id) FROM available_slot a3
    // WHERE a3.wash_bay_id = a2.wash_bay_id
    // AND a3.date >= :date
    // AND a3.time_slot_id >= :startTimeSlotId
    // AND a3.booking_id IS NULL
    // ) >= :slotsNeeded
    // ORDER BY a2.wash_bay_id ASC
    // LIMIT 1
    // )
    // ORDER BY a.date ASC, a.time_slot_id ASC
    // """, nativeQuery = true)
    // List<AvailableSlot> findConsecutiveSlotsFromDate(
    // @Param("date") LocalDate date,
    // @Param("startTimeSlotId") Long startTimeSlotId,
    // @Param("slotsNeeded") int slotsNeeded,
    // Pageable pageable);

    // @Query(value = """
    // SELECT a.* FROM available_slot a
    // WHERE a.date = :date
    // AND a.wash_bay_id = (
    // SELECT a2.wash_bay_id FROM available_slot a2
    // WHERE a2.date = :date
    // AND a2.time_slot_id = :startTimeSlotId
    // AND a2.booking_id IS NULL
    // AND (
    // SELECT COUNT(a3.id) FROM available_slot a3
    // WHERE a3.wash_bay_id = a2.wash_bay_id
    // AND a3.date = :date
    // AND a3.booking_id IS NULL
    // AND a3.time_slot_id >= :startTimeSlotId
    // AND a3.time_slot_id < :startTimeSlotId + :slotsNeeded
    // ) >= :slotsNeeded
    // ORDER BY a2.wash_bay_id ASC
    // LIMIT 1
    // )
    // AND a.booking_id IS NULL
    // AND a.time_slot_id >= :startTimeSlotId
    // AND a.time_slot_id < :startTimeSlotId + :slotsNeeded
    // ORDER BY a.time_slot_id ASC
    // """, nativeQuery = true)

    @Query(value = """
            SELECT a.* FROM available_slot a
            WHERE a.date = :date
            AND a.wash_bay_id = (
                SELECT a2.wash_bay_id FROM available_slot a2
                WHERE a2.date = :date
                AND a2.time_slot_id = :startTimeSlotId
                AND a2.booking_id IS NULL
                AND EXISTS (
                    SELECT 1 FROM wash_bay wb
                    WHERE wb.id = a2.wash_bay_id
                    AND wb.status = 'ACTIVE'
                    AND wb.category = 'NORMAL'
                )
                AND (
                    SELECT COUNT(a3.id) FROM available_slot a3
                    WHERE a3.wash_bay_id = a2.wash_bay_id
                    AND a3.date = :date
                    AND a3.booking_id IS NULL
                    AND a3.time_slot_id >= :startTimeSlotId
                    AND a3.time_slot_id < :startTimeSlotId + :slotsNeeded
                ) >= :slotsNeeded
                ORDER BY a2.wash_bay_id ASC
                LIMIT 1
            )
            AND a.booking_id IS NULL
            AND a.time_slot_id >= :startTimeSlotId
            AND a.time_slot_id < :startTimeSlotId + :slotsNeeded
            ORDER BY a.time_slot_id ASC
            """, nativeQuery = true)
    List<AvailableSlot> findConsecutiveSlotsFromDate(
            @Param("date") LocalDate date,
            @Param("startTimeSlotId") Long startTimeSlotId,
            @Param("slotsNeeded") int slotsNeeded,
            Pageable pageable);

    // @Query(value = """
    // SELECT a.* FROM available_slot a
    // WHERE a.date >= :date
    // AND a.wash_bay_id = (
    // SELECT a2.wash_bay_id FROM available_slot a2
    // WHERE a2.date >= :date
    // AND a2.time_slot_id = :startTimeSlotId
    // AND a2.booking_id IS NULL
    // AND EXISTS (
    // SELECT 1 FROM wash_bay wb
    // WHERE wb.id = a2.wash_bay_id
    // AND wb.status = 'ACTIVE'
    // AND wb.category = 'PREMIUM'
    // )
    // AND (
    // SELECT COUNT(a3.id) FROM available_slot a3
    // WHERE a3.wash_bay_id = a2.wash_bay_id
    // AND a3.date >= :date
    // AND a3.booking_id IS NULL
    // AND a3.time_slot_id >= :startTimeSlotId
    // AND a3.time_slot_id < :startTimeSlotId + :slotsNeeded
    // ) >= :slotsNeeded
    // ORDER BY a2.wash_bay_id ASC
    // LIMIT 1
    // )
    // AND a.booking_id IS NULL
    // AND a.time_slot_id >= :startTimeSlotId
    // AND a.time_slot_id < :startTimeSlotId + :slotsNeeded
    // ORDER BY a.time_slot_id ASC
    // """, nativeQuery = true)
    // List<AvailableSlot> findConsecutiveSlotsFromDateForPremiumServices(
    // @Param("date") LocalDate date,
    // @Param("startTimeSlotId") Long startTimeSlotId,
    // @Param("slotsNeeded") int slotsNeeded,
    // Pageable pageable);

    @Query("""
            SELECT availableSlot FROM AvailableSlot availableSlot
            WHERE availableSlot.booking IS NULL
            AND availableSlot.slotDate <= :date
            """)
    List<AvailableSlot> findSlotsInThePastAndBookingIdIsNull(@Param("date") LocalDate date);

    @Query(value = """
            SELECT availableSlot.*
            FROM available_slot availableSlot
            JOIN time_slot timeSlot ON availableSlot.time_slot_id = timeSlot.id
            JOIN wash_bay washBay ON availableSlot.wash_bay_id = washBay.id
            WHERE
            	washBay.category = 'PREMIUM'
                AND washBay.status = 'ACTIVE'
                AND
            		(
            			(timeSlot.start_time >= :startTime AND availableSlot.date = :date)
            			OR	(timeSlot.start_time >= '07:00:00.000000' AND availableSlot.date > :date)
            		)
            ORDER BY availableSlot.date, timeSlot.start_time
                        """, nativeQuery = true)
    List<AvailableSlot> findConsecutiveSlotsFromDateForPremiumServices(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime, Pageable pageable);

    @Query(value = """
            SELECT availableSlot.*
            FROM available_slot availableSlot
            JOIN time_slot timeSlot ON availableSlot.time_slot_id = timeSlot.id
            JOIN wash_bay washBay ON availableSlot.wash_bay_id = washBay.id
            WHERE
                washBay.status = 'ACTIVE'
                AND washBay.id = :washBayId
                AND availableSlot.booking_id IS NOT NULL
                AND
            		(
            			(timeSlot.start_time >= :startTime AND availableSlot.date = :date)
            			OR	(timeSlot.start_time >= '07:00:00.000000' AND availableSlot.date > :date)
            		)
            ORDER BY availableSlot.date, timeSlot.start_time
                        """, nativeQuery = true)
    List<AvailableSlot> findAllBookedSlotsForCheckingVehicleConfliction(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime, @Param("washBayId") Long washBayId, Pageable pageable);

    @Query("""
            SELECT availableSlot FROM AvailableSlot availableSlot
            WHERE availableSlot.slotDate = :bookingDate AND availableSlot.timeSlot.id = :timeSlotId
            """)
    List<AvailableSlot> findByIdAndBookingdate(@Param("timeSlotId") Long timeSlotId,
            @Param("bookingDate") LocalDate bookingDate);
}
