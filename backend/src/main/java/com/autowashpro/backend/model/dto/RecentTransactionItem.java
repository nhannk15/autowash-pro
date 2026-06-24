package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RecentTransactionItem {
    
    private Long id;
    private LocalDateTime createdAt;
    private String customer;
    private BigDecimal totalAmount;

}
