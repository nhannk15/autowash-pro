package com.autowashpro.backend.model.dto;

import lombok.Data;

@Data
public class VehicleTypeResponse {

    private Long id;
    private String typeName;
    private String description;
    private boolean isActive;

}
