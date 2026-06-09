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
    private Long id;
    private String tierName;
    private int tierLevel;
    private int bookingWindowDays;
    private int priorityQueueOrder;
    private BigDecimal pointEarnRate;
    private int minPointsToMaintain;
    private String perksDescription;
}
