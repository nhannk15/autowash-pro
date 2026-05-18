package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

public class PointTransaction {
    private Long id;
    private Long customerId;
    private Long sessionId;
    private String transactionType;
    private Long pointsChange;
    private Long balanceAfter;
    private String description;
    private LocalDateTime expiryDate;
    private Long createdByStaffId;
    private LocalDateTime createdAt;
}
