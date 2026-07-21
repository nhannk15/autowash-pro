package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
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
public class MembershipTierRequest {

    @NotNull(message = "Booking window days is required")
    @Positive(message = "Booking window days must be positive")
    private Integer bookingWindowDays;

    @NotNull(message = "Point earn rate is required")
    @Positive(message = "Point earn rate must be positive")
    private BigDecimal pointEarnRate;

    @NotNull(message = "Minimum points to maintain is required")
    @Min(value = 0, message = "Minimum points to maintain must be 0 or positive")
    private Integer minPointsToMaintain;

    @NotNull(message = "Point expiration months is required")
    @Positive(message = "Point expiration months must be positive")
    private Integer pointExpirationMonths;

    private String perksDescription;
}
