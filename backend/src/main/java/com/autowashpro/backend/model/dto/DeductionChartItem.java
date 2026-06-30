package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DeductionChartItem {
    
    private LocalDate day;
    private BigDecimal originalRevenue;
    private BigDecimal finalRevenue;
    private BigDecimal promotionDiscount;
    private BigDecimal voucherDiscount;
    private BigDecimal totalDiscount;
    private long orderCount;

}
