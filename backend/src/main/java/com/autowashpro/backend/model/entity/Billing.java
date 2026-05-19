package com.autowashpro.backend.model.entity;

import java.math.BigInteger;
import java.time.LocalDateTime;

public class Billing {
    private Long id;
    private Long sessionId;
    private Long voucherId;
    private BigInteger originalAmount;
    private BigInteger discountAmount;
    private BigInteger finalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    /**
     * How to calculate discount_amount
     * 1. Voucher: Billing.voucher_id --> Voucher.discount_type + discount_value --> voucher_discount
     * 2. Promotion: Sum(PromotionUsage.discount_amount) WHERE billing_id = this --> promotion_total
     * 3. discount_amount = voucher_discount + promotion_total
     * 4. final_amount = MAX(0, original_amount - discount_amount).
     */
}
