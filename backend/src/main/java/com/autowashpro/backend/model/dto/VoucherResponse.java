package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.RewardType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class VoucherResponse {

    private String voucherCode;
    private String rewardName;
    private RewardType discountType;
    private BigDecimal discountValue;
    private String customerName;
    private LocalDateTime issuedAt;

}
