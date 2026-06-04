package com.autowashpro.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.WashBay;

@Repository
public interface WashBayRepository extends JpaRepository<WashBay, Long> {
    
    @Query("""
            SELECT wb FROM WashBay wb 
            WHERE wb.status = 'ACTIVE' 
            AND wb.id NOT IN (
                SELECT b.bay.id FROM Booking b 
                WHERE b.status NOT IN ('CANCELLED') 
                AND b.scheduledDateTime < :endTime 
                AND b.estimatedEndTime > :startTime
            )
            ORDER BY wb.id ASC
            """)
    List<WashBay> findAvailableWashBays(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

}
