package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tier_rules")
public class TierRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "tier_id", nullable = false, unique = true)
    private MembershipTier tier;

    @Column(name = "min_visits_required", nullable = false)
    private int minVisitsRequired;

    @Column(name = "min_spend_required", nullable = false, precision = 12, scale = 2)
    private BigDecimal minSpendRequired;

    @Column(name = "review_period_months")
    private int reviewPeriodMonths;

    @ManyToOne
    @JoinColumn(name = "downgrade_to_tier_id", nullable = true)
    private MembershipTier downgradeTier;
}
