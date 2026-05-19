package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;

public class TierRule {
    private Long id;
    private Long tierId;
    private int minVisitsRequired;
    private BigDecimal minSpendRequired;
    private int reviewPeriodMonths;
    private Long downgradeToTierId;
}
