package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookingDetailResponse {

    private Long servicePriceId;
    private String serviceName;
    private String vehicleTypeName;
    private BigDecimal priceAtBooking;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private String promotionName;

}
