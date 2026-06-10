package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.AvailableSlot;

@Repository
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

    @Query(value = """
            SELECT a.* FROM available_slot a
            WHERE a.date >= :date
            AND a.time_slot_id >= :startTimeSlotId
            AND a.booking_id IS NULL
            AND a.wash_bay_id = (
                SELECT a2.wash_bay_id FROM available_slot a2
                WHERE a2.date >= :date
                AND a2.time_slot_id >= :startTimeSlotId
                AND a2.booking_id IS NULL
                GROUP BY a2.wash_bay_id
                HAVING COUNT(a2.id) >= :slotsNeeded
                ORDER BY a2.wash_bay_id ASC
                LIMIT 1
            )
            ORDER BY a.date ASC, a.time_slot_id ASC
            """, nativeQuery = true)
    List<AvailableSlot> findConsecutiveSlotsFromDate(
            @Param("date") LocalDate date,
            @Param("startTimeSlotId") Long startTimeSlotId,
            @Param("slotsNeeded") int slotsNeeded,
            Pageable pageable);

}
