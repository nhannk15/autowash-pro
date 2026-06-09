package com.autowashpro.backend.model.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class QuickCreateRequest {

    // Customer fields
    private String fullName;
    private String phoneNumber;
    private String email;
    private LocalDate dateOfBirth;

    // Vehicle fields
    private Long vehicleTypeId;
    private String licensePlate;
    private String brand;
    private String model;
    private String color;

}
