package com.autowashpro.backend.model.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.PaymentMethod;
import com.autowashpro.backend.model.enums.PaymentStatus;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "billings")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnoreProperties({ "washSessions", "availableSlots", "bookingDetails", "billing" })
    private Booking booking;

    @OneToOne(optional = true)
    @JoinColumn(name = "voucher_id", nullable = true)
    @JsonIgnoreProperties({ "reward", "customer" })
    private Voucher voucher;

    @Column(precision = 10, scale = 2)
    private BigDecimal originalAmount;

    @Column(name = "discount_amount", nullable = true)
    private BigDecimal discountAmount;

    @Column(name = "final_amount", nullable = false)
    private BigDecimal finalAmount;

    @Column(name = "payment_method", nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(name = "payment_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Column(name = "paid_at", nullable = true)
    private LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Banking Transaction
     */
    @Column(name = "transaction_id", nullable = true, unique = true)
    private String transactionId;

    @Column(name = "reference_code", nullable = true, unique = true)
    private String referenceCode;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    /**
     * How to calculate discount_amount
     * 1. Voucher: Billing.voucher_id --> Voucher.discount_type + discount_value -->
     * voucher_discount
     * 2. Promotion: Sum(PromotionUsage.discount_amount) WHERE billing_id = this -->
     * promotion_total
     * 3. discount_amount = voucher_discount + promotion_total
     * 4. final_amount = MAX(0, original_amount - discount_amount).
     */
}
