package com.autowashpro.backend.model.dto;

import java.time.LocalDate;
import java.time.Month;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class RevenueDataRequest {
    
    private LocalDate startDate;
    private LocalDate endDate;
    private Month month;
    private int year;

}
