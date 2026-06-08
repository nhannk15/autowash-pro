package com.autowashpro.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class VehicleTypeItemResponse {
    
    private Long id;
    private String typeName;
    private String description;
    private boolean isActive;
    
}
