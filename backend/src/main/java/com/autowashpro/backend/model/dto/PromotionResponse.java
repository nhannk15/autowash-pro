package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.PromotionDiscountType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PromotionResponse {
    
    private Long id;
    private String promotionName;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private PromotionDiscountType discountType;
    private BigDecimal discountValue;
    private String serviceName;
    private String minTierName;
    private Long maxUsesTotal;
    private Long maxUsesPerCustomer;
    private Long usageCount;
    private boolean active;
    private String createdByStaff;
    private LocalDateTime createdAt;

}
