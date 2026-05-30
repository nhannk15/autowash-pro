package com.autowashpro.backend.model.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
@Table(name = "customers")
public class Customer extends User {

    @Column(name = "date_of_birth", nullable = true)
    private LocalDate dateOfBirth;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tier_id", nullable = false)
    private MembershipTier tier;

    @Column(name = "current_points")
    private Long currentPoints = 0L;

    @Column(name = "lifetime_points")
    private Long lifetimePoints = 0L;

    @Column(name = "tier_start_date", nullable = false)
    private LocalDate tierStartDate;

    @Column(name = "tier_end_date", nullable = false)
    private LocalDate tierEndDate;

    @Column(name = "last_review_date", nullable = true)
    private LocalDate lastReviewDate;

    @Column(name = "next_review_date", nullable = false)
    private LocalDate nextReviewDate;

    @OneToMany(mappedBy = "customer")
    private List<Vehicle> vehicles;

    @OneToMany(mappedBy = "customer")
    private List<Booking> bookings;

}
