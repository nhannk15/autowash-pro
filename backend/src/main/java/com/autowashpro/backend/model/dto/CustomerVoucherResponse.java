package com.autowashpro.backend.model.dto;

import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.VoucherStatus;

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
public class CustomerVoucherResponse {
    
    private String voucherCode;
    private LocalDateTime expiresAt;
    private RewardResponse reward;
    private VoucherStatus status;

}
