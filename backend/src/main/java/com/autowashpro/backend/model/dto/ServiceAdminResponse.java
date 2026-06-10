package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.ServiceCategory;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ServiceAdminResponse {
    private Long id;
    private String serviceName;
    private String description;
    private int durationMinutes;
    private BigDecimal pointMultiplier;
    private ServiceCategory category;
    private boolean isActive;
    private String image;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
