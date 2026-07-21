package com.autowashpro.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Promotion;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    /**
     * Find all the applicable promotions
     * - active = true
     * - startDate <= bookingDate
     * - endDate >= bookingDate
     * - usageCount < maxUsesTotal
     * - membership NULL (for all Mempership) OR member
     * @param bookingDate
     * @param tierId
     * @return
     */
    @Query("""
                SELECT p FROM Promotion p
                WHERE p.active = true
                AND p.startDate <= :bookingDate
                AND p.endDate >= :bookingDate
                AND p.usageCount < p.maxUsesTotal
                AND (p.membershipTier IS NULL OR p.membershipTier.id <= :tierId)
                ORDER BY p.discountValue DESC
            """)
    List<Promotion> findApplicablePromotions(
            @Param("bookingDate") LocalDateTime bookingDate,
            @Param("tierId") Long tierId);

}
