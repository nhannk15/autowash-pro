package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.PaymentMethod;
import com.autowashpro.backend.model.enums.PaymentStatus;

import lombok.Data;

@Data
public class BillingHistoryDTO {
    
    private Long id;
    private String bookingCode;
    private CustomerVehicleDTO customerVehicleDTO;
    private String transactionType;
    private BigDecimal revenue;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;

}
