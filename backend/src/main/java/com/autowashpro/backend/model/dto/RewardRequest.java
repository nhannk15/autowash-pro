package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;

import com.autowashpro.backend.model.enums.RewardType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RewardRequest {

    @NotBlank(message = "Reward name is required")
    private String rewardName;

    @NotNull(message = "Reward type is required")
    private RewardType rewardType;

    @NotNull(message = "Point cost is required")
    @Positive(message = "Point cost must be positive")
    private Long pointCost;

    private BigDecimal discountValue;

    @NotNull(message = "Validity days is required")
    @Positive(message = "Validity days must be positive")
    private Integer validityDays;

    private Long servicePriceId;

    private String description;

}
