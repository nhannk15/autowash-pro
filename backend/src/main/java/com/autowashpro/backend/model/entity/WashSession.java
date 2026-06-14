package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.WashSessionStatus;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
import jakarta.persistence.PrePersist;
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
@Table(name = "wash_sessions")
public class WashSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = true)
    @JsonIgnoreProperties({"washSessions", "availableSlots", "bookingDetails"})
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"bookings", "vehicles", "washSessions"})
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnoreProperties({"bookings", "washSessions"})
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_price_id", nullable = false)
    @JsonIgnoreProperties({"bookingDetails", "service"})
    private ServicePrice servicePrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnoreProperties({"washSessions", "promotions", "pointTransactions"})
    private Staff staff;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private WashSessionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bay_id")
    @JsonIgnoreProperties({"washSessions", "availableSlots"})
    private WashBay bay;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
