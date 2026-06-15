package com.autowashpro.backend.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.autowashpro.backend.model.enums.WashSessionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CurrentSessionResponse {

    private Long id;
    private WashSessionStatus status;
    private LocalDateTime startTime;
    private WashBayCustomerResponse customer;
    private VehicleResponse vehicle;
    private List<String> services;

}
