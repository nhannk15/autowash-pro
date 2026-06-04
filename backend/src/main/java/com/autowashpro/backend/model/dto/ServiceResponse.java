package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.util.List;

import com.autowashpro.backend.model.enums.ServiceCategory;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class ServiceResponse {
    
    private Long serviceId;
    private String serviceName;
    private String description;
    private int duration;
    private BigDecimal pointMultiplier;
    private ServiceCategory category;
    private boolean isActive;
    private List<ServicePriceItemResponse> servicePrices;

}