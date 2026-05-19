package com.autowashpro.backend.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Customer {
    private Long id;
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String email;
    private LocalDate dateOfBirth;
    private Long tierId;
    private Long currentPoints;
    private Long lifetimePoints;
    private LocalDate tierStartDate;
    private LocalDate tierEndDate; // new
    private LocalDate lastReviewDate;
    private LocalDate nextReviewDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
