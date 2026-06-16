package com.autowashpro.backend.model.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BookingResponse {

    private Long id;
    private String bookingCode;
    private WashBayCustomerResponse customer;
    private VehicleResponse vehicle;
    private List<BookingDetailResponse> bookingDetails;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String washBay;
    
}
