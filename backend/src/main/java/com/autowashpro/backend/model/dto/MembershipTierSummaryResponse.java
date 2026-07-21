package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MembershipTierSummaryResponse {
    /**
     * Membership info
     */
    private Long membershipTierId;
    private String currentTierName;
    private int tierLevel;
    private String nextTierName;
    private int minPointsForNextTier;
    private int minPointsToMaintain;

    /**
     * Tier benefits
     */
    private String perksDescription;
    private int bookingWindowDays;
    private int priorityQueueOrder;
    private BigDecimal pointEarnRate;
}
