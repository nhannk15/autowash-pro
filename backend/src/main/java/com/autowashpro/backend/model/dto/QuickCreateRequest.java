package com.autowashpro.backend.model.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    @NotBlank(message = "Full name is required")
    private String fullName;
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(0[35789])([0-9]{8})$", message = "Invalid phone number")
    private String phoneNumber;
    @Email(message = "Invalid email format")
    private String email;
    private LocalDate dateOfBirth;

    // Vehicle fields
    @NotNull(message = "Vehicle type is required")
    private Long vehicleTypeId;
    @NotBlank(message = "License plate is required")
    private String licensePlate;
    private String brand;
    private String model;
    private String color;

}
