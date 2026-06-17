package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@Table(name = "membership_tiers")
public class MembershipTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tier_name", nullable = false, unique = true)
    private String tierName;

    @Column(name = "tier_level", nullable = false, unique = true)
    private int tierLevel;

    @Column(name = "booking_window_days", nullable = false)
    private int bookingWindowDays;

    @Column(name = "priority_queue_order", nullable = false)
    private int priorityQueueOrder;

    @Column(name = "point_earn_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal pointEarnRate;

    @Column(name = "min_points_for_next_tier", nullable = false)
    private int minPointsForNextTier;

    @Column(name = "min_points_to_maintain", nullable = false)
    private int minPointsToMaintain;

    @Column(name = "perks_description", nullable = true)
    private String perksDescription;

    @OneToMany(mappedBy = "tier")
    @JsonIgnoreProperties("tier")
    private List<Customer> customers;

    @OneToMany(mappedBy = "membershipTier")
    @JsonIgnoreProperties({ "membershipTier", "service", "staff" })
    private List<Promotion> promotions;
}
