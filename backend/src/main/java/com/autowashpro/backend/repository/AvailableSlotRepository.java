package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.util.List;

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
                        SELECT a from AvailableSlot a
                        WHERE a.slotDate >= :date
                        AND a.timeSlot.id >= :startTimeSlotId
                        AND a.booking IS NULL
                        ORDER BY a.slotDate ASC, a.timeSlot.id ASC
                        LIMIT :slotsNeeded
                        """)
        List<AvailableSlot> findConsecutiveSlotsFromDate(
                        @Param("date") LocalDate date,
                        @Param("startTimeSlotId") Long startTimeSlotId,
                        @Param("slotsNeeded") int slotsNeeded);

}
