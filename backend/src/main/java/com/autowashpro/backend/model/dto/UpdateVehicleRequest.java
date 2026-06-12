package com.autowashpro.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UpdateVehicleRequest {

    private Long vehicleTypeId;
    private String licensePlate;
    private String brand;
    private String model;
    private String color;
    private String image;

}
