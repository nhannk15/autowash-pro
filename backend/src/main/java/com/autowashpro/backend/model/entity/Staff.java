package com.autowashpro.backend.model.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Staff {
    private Long id;
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String role;
    private Boolean isActive;
    private LocalDate hireDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // new

}
