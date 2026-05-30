package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.NotificationType;

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
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "notification_type", nullable = true)
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    @Column(name = "title", nullable = true)
    private String title;

    @Column(name = "body", nullable = true)
    private String body;

    @Column(name = "ref_id", nullable = true)
    private Long refId;

    @Column(name = "ref_type", nullable = true)
    private String refType;

    @Column(name = "is_read", nullable = true)
    private boolean isRead;

    @Column(name = "created_at", nullable = true)
    private LocalDateTime createdAt;
}
