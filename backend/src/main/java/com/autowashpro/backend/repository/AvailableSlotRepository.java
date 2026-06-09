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

    @Query("""
            SELECT a FROM AvailableSlot a
            WHERE a.slotDate >= :date
            AND a.timeSlot.id >= :startTimeSlotId
            AND a.booking IS NULL
            AND a.washBay.id = (
                SELECT a2.washBay.id FROM AvailableSlot a2
                WHERE a2.slotDate >= :date
                AND a2.timeSlot.id >= :startTimeSlotId
                AND a2.booking IS NULL
                GROUP BY a2.washBay.id
                HAVING COUNT(a2.id) >= :slotsNeeded
                ORDER BY a2.washBay.id ASC
                LIMIT 1
            )
            ORDER BY a.slotDate ASC, a.timeSlot.id ASC
            """)
    List<AvailableSlot> findConsecutiveSlotsFromDate(
            @Param("date") LocalDate date,
            @Param("startTimeSlotId") Long startTimeSlotId,
            @Param("slotsNeeded") int slotsNeeded,
            Pageable pageable);

}
