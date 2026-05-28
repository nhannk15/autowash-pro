package com.autowashpro.backend.model.entity;

import java.time.LocalDate;
import java.util.List;

import com.autowashpro.backend.model.enums.BayStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@Table(name = "wash_bay")
public class WashBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private BayStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;

    @OneToMany(mappedBy = "bay")
    private List<Booking> bookings;

    @OneToMany(mappedBy = "bay")
    private List<WashSession> washSessions;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDate.now();
    }
}
