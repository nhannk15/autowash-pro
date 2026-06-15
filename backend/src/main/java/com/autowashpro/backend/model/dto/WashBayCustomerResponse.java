package com.autowashpro.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WashBayCustomerResponse {
    
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;

}
