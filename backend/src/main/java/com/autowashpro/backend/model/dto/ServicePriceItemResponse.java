package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ServicePriceItemResponse {
    
    private Long servicePriceId;
    private BigDecimal price;
    private boolean isActive;
    private VehicleTypeItemResponse vehicleType;
    
}
