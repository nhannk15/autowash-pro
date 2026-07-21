package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.RewardType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RewardResponse {

    private Long id;
    private String rewardName;
    private RewardType rewardType;
    private Long pointCost;
    private BigDecimal discountValue;
    private Integer validityDays;
    
    // Extracted from linked ServicePrice if it exists
    private String serviceName; 
    
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
