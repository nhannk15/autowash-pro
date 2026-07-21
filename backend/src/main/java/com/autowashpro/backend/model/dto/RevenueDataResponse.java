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
public class RevenueDataResponse {
    
    private LocalDate day;
    private int totalOrders;
    private BigDecimal revenue;

}
