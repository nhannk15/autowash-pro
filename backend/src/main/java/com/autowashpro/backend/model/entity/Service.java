package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;

public class Service {
    private Long id;
    private String serviceName;
    private String description;
    private BigDecimal basePrice;
    private int durationMinutes;
    private BigDecimal pointMultiplier;
    private String category;
    private boolean isActive;
}
