package com.autowashpro.backend.model.entity;

import java.math.BigInteger;
import java.time.LocalDateTime;

import org.springframework.boot.autoconfigure.jms.JmsProperties.Listener.Session;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "billings")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "session_id")
    private Session session;

    @OneToOne(optional = true)
    @JoinColumn(name = "voucher_id", nullable = true)
    private Long voucherId;

    @Column(name = "original_amount", nullable = false)
    private BigInteger originalAmount;

    @Column(name = "discount_amount", nullable = true)
    private BigInteger discountAmount;

    @Column(name = "final_amount", nullable = false)
    private BigInteger finalAmount;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * How to calculate discount_amount
     * 1. Voucher: Billing.voucher_id --> Voucher.discount_type + discount_value --> voucher_discount
     * 2. Promotion: Sum(PromotionUsage.discount_amount) WHERE billing_id = this --> promotion_total
     * 3. discount_amount = voucher_discount + promotion_total
     * 4. final_amount = MAX(0, original_amount - discount_amount).
     */
}
