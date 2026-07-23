package com.autowashpro.backend.model.dto;

import lombok.Data;

@Data
public class CustomerVehicleDTO {
    
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;

}
