package com.autowashpro.backend.repository;

import java.time.LocalDate;
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
            GROUP BY s.timeSlot.id, s.timeSlot.startTime, s.timeSlot.endTime
            ORDER BY s.timeSlot.startTime ASC
            """)
    List<Object[]> findTimeSlotAvailability(@Param("date") LocalDate date);

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

    @Query(value = """
            SELECT a.* FROM available_slot a
            WHERE a.date = :date
            AND a.wash_bay_id = (
                SELECT a2.wash_bay_id FROM available_slot a2
                WHERE a2.date = :date
                AND a2.time_slot_id = :startTimeSlotId
                AND a2.booking_id IS NULL
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

}
