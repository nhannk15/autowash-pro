package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Reward {
    private Long id;
    private String rewardName;
    private String rewardType;
    private Long pointCost;
    private BigDecimal discountValue;
    private Integer validityDays;
    private Long serviceId;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
}
