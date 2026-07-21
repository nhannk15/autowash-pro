package com.autowashpro.backend.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.autowashpro.backend.model.enums.TransactionType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RecentTransactionResponse {
    
    private List<String> services;
    private String voucherName;
    private LocalDateTime createdAt;
    private Long pointsChange;
    private TransactionType transactionType;
    private String description;

}
