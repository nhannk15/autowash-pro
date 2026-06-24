package com.autowashpro.backend.model.dto;

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
public class ApplyVoucherToBillingRequest {
    private Long customerId;
    private Long billingId;
    private String voucherCode;
}
