package com.autowashpro.backend.model.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class VehicleAdminResponse {
    private Long id;
    private VehicleTypeItemResponse vehicleType;
    private String licensePlate;
    private String brand;
    private String model;
    private String color;
    private String image;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
