package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.model.enums.WashSessionStatus;

public interface WashSessionRepository extends JpaRepository<WashSession, Long> {
    
    List<WashSession> findByBookingId(Long id);

    default Long countByStatusAndDate(WashSessionStatus status, LocalDate date) {
        return countByStatusAndCreatedAtRange(status, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }

    @Query("""
            SELECT COUNT(washSession) FROM WashSession washSession
            WHERE washSession.status = :status
            AND washSession.createdAt >= :startOfDay
            AND washSession.createdAt < :nextDay
            """)
    Long countByStatusAndCreatedAtRange(@Param("status") WashSessionStatus status,
                                        @Param("startOfDay") LocalDateTime startOfDay,
                                        @Param("nextDay") LocalDateTime nextDay);

}
