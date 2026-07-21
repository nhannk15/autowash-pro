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
public class CreatePromotionRequest {

    private String promotionName;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private PromotionDiscountType discountType;
    private BigDecimal discountValue;
    private Long serviceId;
    private Long minTierId;
    private Long maxUsesTotal;
    private Long maxUsesPerCustomer;
    private Long usageCount;

}
