package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Voucher {
    private Long id;
    private String voucherCode;
    private Long rewardId;
    private String discountType;
    private BigDecimal discountValue;
    private Long customerId;
    private String status;
    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime usedAt;
    
}
