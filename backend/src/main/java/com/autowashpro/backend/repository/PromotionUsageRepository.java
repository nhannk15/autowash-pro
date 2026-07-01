package com.autowashpro.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.dto.PromotionPerformanceItem;
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

    @Query("""
            SELECT new com.autowashpro.backend.model.dto.PromotionPerformanceItem(
                promotion.id,
                promotion.promotionName,
                promotion.discountType,
                promotion.discountValue,
                COUNT(promotionUsage),
                promotion.maxUsesTotal,
                SUM(promotionUsage.discountAmount),
                ROUND(COUNT(promotionUsage) * 100.0/ promotion.maxUsesTotal, 1)
            )
            FROM PromotionUsage promotionUsage
            JOIN promotionUsage.promotion promotion
            WHERE promotionUsage.usedAt >= :startTime AND promotionUsage.usedAt <= :endTime
            GROUP BY promotion.id, promotion.promotionName
            ORDER BY SUM(promotionUsage.discountAmount)
            """)
    List<PromotionPerformanceItem> getPerformanceItems(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("""
            SELECT new com.autowashpro.backend.model.dto.PromotionPerformanceItem(
                promotion.id,
                promotion.promotionName,
                promotion.discountType,
                promotion.discountValue,
                COUNT(promotionUsage),
                promotion.maxUsesTotal,
                SUM(promotionUsage.discountAmount),
                ROUND(COUNT(promotionUsage) * 100.0/ promotion.maxUsesTotal, 1)
            )
            FROM PromotionUsage promotionUsage
            JOIN promotionUsage.promotion promotion
            GROUP BY promotion.id, promotion.promotionName, promotion.discountType, promotion.discountValue, promotion.maxUsesTotal
            ORDER BY SUM(promotionUsage.discountAmount)
            """)
    List<PromotionPerformanceItem> getPerformanceItemsAtTheVeryFirst();

}
