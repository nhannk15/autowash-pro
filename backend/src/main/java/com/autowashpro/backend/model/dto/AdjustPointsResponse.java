package com.autowashpro.backend.model.dto;

import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.TransactionType;

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
public class AdjustPointsResponse {

    private Long customerId;
    private String customerName;
    private Long currentPoints;
    private Long transactionId;
    private TransactionType transactionType;
    private Long pointsChange;
    private Long balanceAfter;
    private String description;
    private String createdByStaffName;
    private LocalDateTime createdAt;
}
