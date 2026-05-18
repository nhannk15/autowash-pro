package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Promotion {
    private Long id;
    private String promotionName;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String discountType;
    private BigDecimal discountValue;
    private Long serviceId;
    private Long minTireId;
    private Long maxUsesTotal;
    private Long maxUsesPerCustomer;
    private Long usageCount;
    private boolean active;
    private Long createdByStaffId;
    private LocalDateTime createdAt;
}
