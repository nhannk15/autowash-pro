package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.PromotionDiscountType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "promotions")
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "promotion_name", nullable = false)
    private String promotionName;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "discount_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PromotionDiscountType discountType;

    @Column(name = "discount_value", nullable = false)
    private BigDecimal discountValue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "min_tire_id")
    private MembershipTier membershipTier;

    @Column(name = "max_uses_total", nullable = false)
    private Long maxUsesTotal;

    @Column(name = "max_uses_per_customer", nullable = false)
    private Long maxUsesPerCustomer;

    @Column(name = "usage_count", nullable = false)
    private Long usageCount;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_staff_id")
    private Staff staff;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
