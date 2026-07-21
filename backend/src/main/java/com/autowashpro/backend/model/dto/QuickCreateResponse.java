package com.autowashpro.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class QuickCreateResponse {

    private Long customerId;
    private Long vehicleId;
    private String customerName;
    private String phoneNumber;
    private String licensePlate;

}
