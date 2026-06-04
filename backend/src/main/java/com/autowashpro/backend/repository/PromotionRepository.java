package com.autowashpro.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.Promotion;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    /**
     * Find all promotions eligible for customer right the booking time:
     * - Still in date, available usage, active
     * - Eligible Tier
     * - service == null means for all or one service only
     */

    @Query("""
            SELECT p FROM Promotion p
            WHERE p.active = true
            AND p.startDate <= :now
            AND p.endDate >= :now
            AND p.usageCount < p.maxUsesTotal
            AND (p.membershipTier IS NULL OR p.membershipTier.tierLevel <= :customerTierLevel)
            AND (p.service IS NULL OR p.service.id IN :serviceIds)
            AND p.maxUsesPerCustomer > (
                SELECT COUNT(pu) FROM PromotionUsage pu
                JOIN pu.billing b
                JOIN b.session s
                JOIN s.booking bk
                WHERE pu.promotion = p
                AND bk.customer.id = :customerId
            )
            """)
    List<Promotion> findEligiblePromotion(
            @Param("now") LocalDateTime now,
            @Param("customerTierLevel") int customerTierLevel,
            @Param("serviceIds") List<Long> serviceIds,
            @Param("customerId") Long customerId);

}
