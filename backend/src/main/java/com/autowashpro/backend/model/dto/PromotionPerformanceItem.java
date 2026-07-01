package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;

import com.autowashpro.backend.model.enums.PromotionDiscountType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PromotionPerformanceItem {

    private Long promotionId;
    private String promotionName;
    private PromotionDiscountType promotionDiscountType;
    private BigDecimal discountValue;
    private Long usageCount;
    private Long maxUsesTotal;
    private BigDecimal totalDiscountAmount;
    private Double usageRate;

}
