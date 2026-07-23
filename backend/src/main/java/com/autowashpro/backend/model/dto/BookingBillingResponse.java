package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.DepositStatus;
import com.autowashpro.backend.model.enums.PaymentMethod;
import com.autowashpro.backend.model.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BookingBillingResponse {

    private Long id;
    private VoucherResponse voucher;
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private BigDecimal depositAmount; 
    private LocalDateTime depositExpiry;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private DepositStatus depositStatus;
    
}
