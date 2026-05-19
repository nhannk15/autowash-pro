package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;

public class MembershipTier {
    private Long id;
    private String tierName;
    private int tierLevel;
    private int bookingWindowDays;
    private int priorityQueueOrder;
    private BigDecimal pointEarnRate;
    private int minPointsToMaintain;
    private String perksDescription;
}
