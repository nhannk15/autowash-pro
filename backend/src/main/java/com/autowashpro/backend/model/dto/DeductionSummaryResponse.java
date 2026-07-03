package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DeductionSummaryResponse {
    
    private BigDecimal totalOriginalRevenue;
    private BigDecimal totalFinalRevenue;
    private BigDecimal totalDiscount;
    private BigDecimal totalPromotionDiscount;
    private BigDecimal totalVoucherDiscount;
    private BigDecimal discountRate;
    private long totalPromotionUsages;
    private long totalVoucherUsages;

}
