package com.autowashpro.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.PromotionUsage;

public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {

    @Query("""
            SELECT
                promotionUsage
            FROM PromotionUsage promotionUsage
            WHERE
                promotionUsage.usedAt >= :startTime
            AND promotionUsage.usedAt <= :endTime
            """)
    List<PromotionUsage> findFromStartTimeToEndTime(@Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("""
            SELECT
                COUNT(promotionUsage.id)
            FROM PromotionUsage promotionUsage
            WHERE
                promotionUsage.usedAt >= :startTime
            AND promotionUsage.usedAt <= :endTime
            """)
    long countFromStartTimeToEndTime(@Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

}
