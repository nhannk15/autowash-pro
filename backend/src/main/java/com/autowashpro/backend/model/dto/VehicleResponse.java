package com.autowashpro.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class VehicleResponse {
    private Long vehicleId;
    private String typeName;
    private String licensePlate;
    private String brand;
    private String model;
    private String color;
    private String image;
    private boolean isActive;
}
