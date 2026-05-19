package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PromotionUsage {
    private Long id;
    private Long promotionId;
    private Long billingId;
    private BigDecimal discountAmount;
    private LocalDateTime usedAt;
}
