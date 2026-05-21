package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.util.List;

import com.autowashpro.backend.model.enums.ServiceCategory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "services")
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(name = "description", nullable = true)
    private String description;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "point_multiplier", nullable = false, precision = 4, scale = 2)
    private BigDecimal pointMultiplier;

    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private ServiceCategory category;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    @OneToMany(mappedBy = "service")
    private List<Booking> bookings;
}
